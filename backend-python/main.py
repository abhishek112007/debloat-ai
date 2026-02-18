"""
Persistent Backend Process
Reads JSON commands from stdin, writes JSON responses to stdout.
Stays alive for the lifetime of the Electron app (no per-call spawn overhead).
"""
import sys
import json
import traceback
from adb_operations import ADBOperations, ADBError
from ai_advisor import AIAdvisor
from backup_manager import BackupManager


def handle_command(command_data, adb, backup_mgr, advisor):
    """Route a single command and return the result."""
    command = command_data.get("command")
    args = command_data.get("args", {})

    if command == "get_device_info":
        try:
            return adb.get_device_info()
        except ADBError:
            return None

    elif command == "list_packages":
        try:
            return adb.list_packages(args.get("type", "all"))
        except ADBError:
            return []

    elif command == "uninstall_package":
        return adb.uninstall_package(args.get("packageName"))

    elif command == "reinstall_package":
        return adb.reinstall_package(args.get("packageName"))

    elif command == "analyze_package":
        return advisor.analyze_package(args.get("packageName"))

    elif command == "chat_message":
        response = advisor.chat(args.get("message", ""), args.get("history", []))
        return {"response": response}

    elif command == "create_backup":
        return backup_mgr.create_backup(args.get("packages", []), args.get("deviceInfo"))

    elif command == "list_backups":
        return backup_mgr.list_backups()

    elif command == "restore_backup":
        return backup_mgr.restore_backup(args.get("backupName"))

    elif command == "delete_backup":
        return backup_mgr.delete_backup(args.get("backupName"))

    elif command == "get_backup_path":
        return {"path": backup_mgr.get_backup_path()}

    else:
        return {"success": False, "error": f"Unknown command: {command}"}


def main():
    """
    Persistent process: initialise modules once, then loop over stdin lines.
    Each line is a JSON object with {id, command, args}.
    Each response is a JSON object with {id, result} or {id, error}.
    """
    # Initialise heavy modules once
    adb = ADBOperations()
    backup_mgr = BackupManager()
    try:
        advisor = AIAdvisor(provider="perplexity")
    except Exception as e:
        print(f"[Warning] AI advisor init failed: {e}", file=sys.stderr)
        advisor = AIAdvisor.__new__(AIAdvisor)
        advisor.api_key = None
        advisor.provider = "perplexity"
        advisor.api_url = "https://api.perplexity.ai/chat/completions"
        advisor.model = "sonar"

    # Signal that we are ready
    sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
    sys.stdout.flush()

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break  # EOF – Electron closed our stdin
            line = line.strip()
            if not line:
                continue

            request = json.loads(line)
            request_id = request.get("id")

            try:
                result = handle_command(request, adb, backup_mgr, advisor)
                response = {"id": request_id, "result": result}
            except Exception as exc:
                response = {"id": request_id, "error": str(exc)}

            sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()

        except json.JSONDecodeError as exc:
            sys.stdout.write(json.dumps({"id": None, "error": f"JSON parse error: {exc}"}) + "\n")
            sys.stdout.flush()
        except Exception:
            traceback.print_exc(file=sys.stderr)


if __name__ == "__main__":
    main()

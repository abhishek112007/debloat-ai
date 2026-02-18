"""
AI Advisor Module
Handles AI-powered package analysis using Perplexity or OpenAI
"""
import os
import json
import requests
from typing import Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIAdvisor:
    """AI-powered package analysis"""
    
    def __init__(self, provider: str = "perplexity"):
        """
        Initialize AI advisor
        
        Args:
            provider: "perplexity" or "openai"
        """
        self.provider = provider
        
        if provider == "perplexity":
            self.api_key = os.getenv("PERPLEXITY_API_KEY")
            self.api_url = "https://api.perplexity.ai/chat/completions"
            self.model = "sonar"  # Updated model name for Perplexity API
        else:  # openai
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.api_url = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4-turbo-preview"
        
        if not self.api_key:
            raise ValueError(f"{provider.upper()}_API_KEY not found in environment variables")
    
    def analyze_package(self, package_name: str) -> Dict:
        """Analyze an Android package and return safety information"""
        
        prompt = f"""You are an Android package analysis expert. Analyze package: {package_name}

Return ONLY valid JSON (no markdown, no explanation):
{{
  "packageName": "{package_name}",
  "summary": "Brief description in plain English",
  "purpose": "What this package does",
  "dependencies": ["list of packages that might depend on this"],
  "safeToRemove": true/false,
  "riskCategory": "Safe/Caution/Expert/Dangerous",
  "consequences": ["what happens if removed"],
  "userReports": ["common user experiences"],
  "technicalDetails": "Technical information",
  "bestCase": "Best case scenario if removed",
  "worstCase": "Worst case scenario if removed"
}}

Risk categories:
- Safe: Third-party apps, easily reinstallable
- Caution: OEM apps, may affect minor features
- Expert: May break functionality
- Dangerous: Critical system components"""

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            messages = []
            
            # Perplexity doesn't support system role, combine into user message
            if self.provider == "perplexity":
                messages = [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            else:
                # OpenAI supports system role
                messages = [
                    {
                        "role": "system",
                        "content": "You are an Android debloating expert. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": 1500
            }
            
            # Add provider-specific parameters
            if self.provider == "perplexity":
                payload.update({
                    "return_citations": False,
                    "return_images": False,
                    "search_recency_filter": "month"
                })
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            # Debug: Print error details if request fails
            if response.status_code != 200:
                print(f"Error Response Status: {response.status_code}")
                print(f"Error Response Body: {response.text}")
            
            response.raise_for_status()
            data = response.json()
            
            # Extract content
            content = data["choices"][0]["message"]["content"]
            
            # Clean markdown if present
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Parse JSON
            analysis = json.loads(content)
            return analysis
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            raise Exception(f"Analysis failed: {str(e)}")
    
    def chat(self, message: str, history: list = None) -> str:
        """Chat with AI about debloating"""
        
        if history is None:
            history = []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            messages = []
            
            # Perplexity doesn't support system role
            if self.provider == "perplexity":
                # Just add history and current message
                messages.extend(history)
                messages.append({
                    "role": "user",
                    "content": message
                })
            else:
                # OpenAI supports system role
                messages = [
                    {
                        "role": "system",
                        "content": """You are a helpful Android debloating expert assistant. 
Help users understand which apps are safe to remove and answer their questions about Android packages.
Be concise and friendly."""
                    }
                ]
                # Add history
                messages.extend(history)
                # Add current message
                messages.append({
                    "role": "user",
                    "content": message
                })
            
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 800
            }
            
            if self.provider == "perplexity":
                payload.update({
                    "return_citations": False,
                    "return_images": False
                })
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            raise Exception(f"Chat failed: {str(e)}")


# Example usage
if __name__ == "__main__":
    # Test the advisor
    advisor = AIAdvisor(provider="perplexity")
    
    result = advisor.analyze_package("com.facebook.katana")
    print(json.dumps(result, indent=2))

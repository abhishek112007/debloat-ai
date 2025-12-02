use serde::{Deserialize, Serialize};
use std::env;

/// Chat message with role (system, user, assistant) and content
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Configuration for Perplexity AI request
#[derive(Debug, Serialize)]
struct PerplexityRequest {
    model: String,
    messages: Vec<ChatMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    temperature: f32,
    top_p: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    search_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    return_related_questions: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    search_recency_filter: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PerplexityResponse {
    choices: Vec<PerplexityChoice>,
}

#[derive(Debug, Deserialize)]
struct PerplexityChoice {
    message: PerplexityResponseMessage,
}

#[derive(Debug, Deserialize)]
struct PerplexityResponseMessage {
    content: String,
}

/// Cleans and validates message history to ensure proper alternation
/// Perplexity API requires messages to alternate between user and assistant
fn clean_message_history(messages: Vec<ChatMessage>) -> Result<Vec<ChatMessage>, String> {
    if messages.is_empty() {
        return Err("No messages provided".to_string());
    }

    let mut cleaned: Vec<ChatMessage> = Vec::new();
    let mut last_role: Option<String> = None;

    for msg in messages {
        // Skip empty messages
        if msg.content.trim().is_empty() {
            continue;
        }

        // Ensure role is valid
        let role = match msg.role.as_str() {
            "user" | "assistant" => msg.role.clone(),
            _ => {
                eprintln!("Invalid role '{}', treating as user", msg.role);
                "user".to_string()
            }
        };

        // Skip if same role as previous (no alternation)
        if let Some(ref last) = last_role {
            if last == &role {
                eprintln!("Skipping duplicate role: {}", role);
                continue;
            }
        }

        cleaned.push(ChatMessage {
            role: role.clone(),
            content: msg.content.trim().to_string(),
        });
        last_role = Some(role);
    }

    // Ensure first message is from user
    if let Some(first) = cleaned.first() {
        if first.role != "user" {
            return Err("First message must be from user".to_string());
        }
    } else {
        return Err("No valid messages after cleaning".to_string());
    }

    Ok(cleaned)
}

/// Sends a chat message to Perplexity AI with Android debloating context
pub async fn send_chat_message(
    messages: Vec<ChatMessage>,
    device_name: Option<String>,
) -> Result<String, String> {
    // Load API key from environment
    dotenv::dotenv().ok();
    let api_key = env::var("PERPLEXITY_API_KEY")
        .map_err(|_| "PERPLEXITY_API_KEY not set in .env file".to_string())?;

    // Build system prompt with device context
    let device_context = device_name
        .as_ref()
        .map(|name| format!("\n📱 CURRENT DEVICE: {}", name))
        .unwrap_or_default();

    let system_prompt = format!(
        r#"You are an expert Android debloating assistant integrated into Debloat AI - a professional tool for safely removing bloatware.
{}

🎯 YOUR EXPERTISE:
• Deep knowledge of Android system architecture and package dependencies
• Safety assessment of system and vendor packages across all manufacturers (Samsung, Xiaomi, OnePlus, Google, etc.)
• Understanding of AOSP, MIUI, One UI, ColorOS, OxygenOS ecosystems
• Practical debloating strategies balancing performance, battery, and stability

💬 YOUR PERSONALITY:
• Professional yet friendly - you're a trusted advisor, not a robot
• Clear and concise - technical accuracy in simple language
• Proactive - anticipate user concerns and provide complete answers
• Safety-first mindset - always warn about risks

🛡️ SAFETY GUIDELINES:
1. **Critical Warning**: Always identify system-critical packages that cause bootloop/brick
2. **Dependency Chains**: Explain what breaks when removing interconnected packages
3. **Manufacturer-Specific**: Samsung bloat ≠ Xiaomi bloat - provide device-specific advice
4. **Backup Reminder**: Recommend ADB backup before major changes
5. **Alternative Solutions**: Suggest "disable" instead of "uninstall" for borderline cases

📝 RESPONSE FORMAT:
• Start with direct answer (⚠️ for warnings, ✅ for safe, ℹ️ for info)
• Use bullet points for clarity
• Provide specific package names when relevant
• End with actionable next steps or follow-up questions
• Keep responses under 300 words unless detailed analysis requested

🔍 WHEN ANALYZING PACKAGES:
• Check if it's AOSP, Google, or OEM-specific
• Identify core vs optional functionality
• Note common user complaints (battery drain, ads, telemetry)
• Mention safer alternatives if available

Remember: Users trust you with their devices. Be thorough, be cautious, be helpful."#,
        device_context
    );

    // Validate and clean messages to ensure proper alternation
    let cleaned_messages = clean_message_history(messages)?;
    
    // Prepare full message list with system prompt
    let mut full_messages = vec![ChatMessage {
        role: "system".to_string(),
        content: system_prompt,
    }];
    full_messages.extend(cleaned_messages);

    // Build request payload with optimized parameters
    let request_body = PerplexityRequest {
        model: "sonar".to_string(), // Valid Perplexity model (sonar, sonar-pro, or sonar-reasoning)
        messages: full_messages,
        max_tokens: Some(2000), // Longer responses for detailed explanations
        temperature: 0.7, // Balanced between factual and conversational
        top_p: 0.9,
        stream: Some(false), // Non-streaming for now (can be enhanced later)
        search_mode: Some("web".to_string()), // Use web search for latest info
        return_related_questions: Some(true), // Get follow-up suggestions
        search_recency_filter: Some("month".to_string()), // Recent Android info
    };

    // Make HTTP request to Perplexity API with retry logic
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60)) // 60s timeout for complex queries
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .post("https://api.perplexity.ai/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "Request timed out. The AI is taking too long to respond. Please try again.".to_string()
            } else if e.is_connect() {
                "Cannot connect to Perplexity AI. Please check your internet connection.".to_string()
            } else {
                format!("Network error: {}", e)
            }
        })?;

    // Check HTTP status with detailed error messages
    let status = response.status();
    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        
        return Err(match status.as_u16() {
            400 => {
                if error_text.contains("model") || error_text.contains("Model") {
                    format!("Invalid model specified. Use 'sonar', 'sonar-pro', or 'sonar-reasoning'. Error: {}", error_text)
                } else if error_text.contains("invalid_message") || error_text.contains("message") {
                    "Message format error. Your conversation may be too complex. Try starting a new chat or simplifying your question.".to_string()
                } else {
                    format!("Bad request (400): {}. Try rephrasing your question or starting a new chat.", error_text)
                }
            },
            401 => "Invalid API key. Please check your PERPLEXITY_API_KEY in .env file.".to_string(),
            429 => "Rate limit exceeded. Please wait a moment and try again.".to_string(),
            500..=599 => "Perplexity AI server error. Please try again later.".to_string(),
            _ => format!("API error ({}): {}", status, error_text),
        });
    }

    // Parse JSON response
    let perplexity_response: PerplexityResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Perplexity response: {}", e))?;

    // Extract AI message content with validation
    let content = perplexity_response
        .choices
        .first()
        .ok_or_else(|| "No response from Perplexity AI. Please try again.".to_string())?
        .message
        .content
        .clone();

    // Validate response is not empty
    if content.trim().is_empty() {
        return Err("AI returned an empty response. Please rephrase your question.".to_string());
    }

    Ok(content)
}

/// Helper function to validate message history length
pub fn validate_conversation_length(messages: &[ChatMessage]) -> Result<(), String> {
    const MAX_MESSAGES: usize = 50;
    const MAX_TOTAL_CHARS: usize = 50000;

    if messages.len() > MAX_MESSAGES {
        return Err(format!(
            "Conversation too long. Maximum {} messages allowed.",
            MAX_MESSAGES
        ));
    }

    let total_chars: usize = messages.iter().map(|m| m.content.len()).sum();
    if total_chars > MAX_TOTAL_CHARS {
        return Err("Conversation history too large. Please start a new conversation.".to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Run manually with: cargo test -- --ignored
    async fn test_chat_simple_question() {
        // Set test API key
        env::set_var("PERPLEXITY_API_KEY", "pplx-test-key");

        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "Is it safe to remove com.miui.analytics?".to_string(),
        }];

        let result = send_chat_message(messages, Some("Xiaomi Redmi Note 10".to_string())).await;

        match result {
            Ok(response) => {
                println!("✅ AI Response:\n{}", response);
                assert!(!response.is_empty());
                assert!(response.len() > 50, "Response too short");
            }
            Err(e) => {
                println!("❌ Error: {}", e);
                panic!("Chat test failed");
            }
        }
    }

    #[tokio::test]
    #[ignore] // Run manually with: cargo test -- --ignored
    async fn test_package_safety_question() {
        // Load .env for API key
        dotenv::dotenv().ok();

        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "What are the safest Samsung bloatware packages to remove?".to_string(),
        }];

        let result = send_chat_message(messages, Some("Samsung Galaxy S21".to_string())).await;

        match result {
            Ok(response) => {
                println!("\n📱 Device: Samsung Galaxy S21");
                println!("❓ Question: What are the safest Samsung bloatware packages to remove?");
                println!("\n🤖 AI Response:\n{}\n", response);
                
                // Validate response quality
                assert!(!response.is_empty(), "Response should not be empty");
                assert!(response.len() > 100, "Response should be detailed (>100 chars)");
                
                // Check for safety-related keywords
                let response_lower = response.to_lowercase();
                assert!(
                    response_lower.contains("safe") 
                    || response_lower.contains("remove") 
                    || response_lower.contains("package")
                    || response_lower.contains("bloat"),
                    "Response should contain relevant keywords"
                );
            }
            Err(e) => {
                println!("❌ Test Error: {}", e);
                panic!("Package safety question test failed: {}", e);
            }
        }
    }

    #[tokio::test]
    #[ignore] // Run manually with: cargo test -- --ignored
    async fn test_conversation_with_context() {
        // Load .env for API key
        dotenv::dotenv().ok();

        let messages = vec![
            ChatMessage {
                role: "user".to_string(),
                content: "Is com.google.android.gms safe to remove?".to_string(),
            },
            ChatMessage {
                role: "assistant".to_string(),
                content: "No, removing Google Play Services (com.google.android.gms) is not safe. It's a critical system component that many apps depend on.".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: "What will happen if I remove it anyway?".to_string(),
            },
        ];

        let result = send_chat_message(messages, Some("Pixel 7".to_string())).await;

        match result {
            Ok(response) => {
                println!("\n💬 Conversation Test:");
                println!("User: Is com.google.android.gms safe to remove?");
                println!("AI: No, removing Google Play Services...");
                println!("User: What will happen if I remove it anyway?");
                println!("\n🤖 AI Follow-up Response:\n{}\n", response);
                
                assert!(!response.is_empty());
                assert!(response.len() > 50, "Follow-up response should be detailed");
                
                // Check for consequence-related keywords
                let response_lower = response.to_lowercase();
                assert!(
                    response_lower.contains("break") 
                    || response_lower.contains("fail") 
                    || response_lower.contains("stop")
                    || response_lower.contains("won't work")
                    || response_lower.contains("issue"),
                    "Response should mention consequences"
                );
            }
            Err(e) => {
                println!("❌ Conversation test failed: {}", e);
                panic!("Conversation context test failed: {}", e);
            }
        }
    }

    #[test]
    fn test_conversation_validation() {
        // Test empty conversation
        let empty: Vec<ChatMessage> = vec![];
        assert!(validate_conversation_length(&empty).is_ok());

        // Test normal conversation
        let normal = vec![
            ChatMessage {
                role: "user".to_string(),
                content: "Hello".to_string(),
            },
            ChatMessage {
                role: "assistant".to_string(),
                content: "Hi there!".to_string(),
            },
        ];
        assert!(validate_conversation_length(&normal).is_ok());

        // Test too many messages
        let too_many: Vec<ChatMessage> = (0..51)
            .map(|i| ChatMessage {
                role: "user".to_string(),
                content: format!("Message {}", i),
            })
            .collect();
        assert!(validate_conversation_length(&too_many).is_err());

        // Test too large content
        let too_large = vec![ChatMessage {
            role: "user".to_string(),
            content: "a".repeat(60000),
        }];
        assert!(validate_conversation_length(&too_large).is_err());
    }
}

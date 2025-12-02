use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageAnalysis {
    #[serde(rename = "packageName")]
    pub package_name: String,
    pub summary: String,
    pub purpose: String,
    pub dependencies: Vec<String>,
    #[serde(rename = "safeToRemove")]
    pub safe_to_remove: bool,
    #[serde(rename = "riskCategory")]
    pub risk_category: String,
    pub consequences: Vec<String>,
    #[serde(rename = "userReports")]
    pub user_reports: Vec<String>,
    #[serde(rename = "technicalDetails")]
    pub technical_details: String,
    #[serde(rename = "bestCase")]
    pub best_case: String,
    #[serde(rename = "worstCase")]
    pub worst_case: String,
}

#[derive(Debug, Serialize)]
struct PerplexityRequest {
    model: String,
    messages: Vec<PerplexityMessage>,
    max_tokens: u32,
    temperature: f32,
    top_p: f32,
    return_citations: bool,
    return_images: bool,
    search_recency_filter: String,
}

#[derive(Debug, Serialize)]
struct PerplexityMessage {
    role: String,
    content: String,
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

/// Analyzes an Android package using Perplexity AI
pub async fn analyze_package(package_name: &str) -> Result<PackageAnalysis, String> {
    // Get API key from environment variable
    let api_key = env::var("PERPLEXITY_API_KEY")
        .map_err(|_| "PERPLEXITY_API_KEY environment variable not set. Please add it to your .env file.".to_string())?;

    // Build the prompt
    let prompt = format!(
        r#"Analyze the Android package "{}" and provide a comprehensive safety assessment.

OUTPUT MUST BE VALID JSON with this exact structure:
{{
  "packageName": "{}",
  "summary": "One-sentence plain English explanation",
  "purpose": "Technical function and role in Android system",
  "dependencies": ["list", "of", "dependent", "packages"],
  "safeToRemove": true_or_false,
  "riskCategory": "Safe|Caution|Expert|Dangerous",
  "consequences": ["what", "breaks", "if", "removed"],
  "userReports": ["known issues from Reddit/XDA/forums"],
  "technicalDetails": "Deep technical explanation",
  "bestCase": "Best outcome if uninstalled",
  "worstCase": "Worst outcome if uninstalled"
}}

Assessment criteria:
1. **Safe**: Third-party bloatware, telemetry, ads - no system impact
2. **Caution**: Vendor features (themes, gestures) - removable but affects UX
3. **Expert**: System services with alternatives available - requires knowledge
4. **Dangerous**: Core Android components - removal causes bootloop/crash

CRITICAL RULES:
- Output ONLY valid JSON, no markdown, no code blocks, no explanations
- All string values must be actual content, not placeholders
- Dependencies must be real package names or empty array
- User reports must be specific findings or "No major issues reported"
- Risk category must be one of: Safe, Caution, Expert, Dangerous

Search Reddit, XDA, and Android forums for real user experiences with this package."#,
        package_name, package_name
    );

    // Build request
    let request_body = PerplexityRequest {
        model: "sonar".to_string(), // Valid Perplexity model
        messages: vec![PerplexityMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        max_tokens: 2000,
        temperature: 0.2,
        top_p: 0.9,
        return_citations: true,
        return_images: false,
        search_recency_filter: "month".to_string(),
    };

    // Make HTTP request
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.perplexity.ai/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Perplexity API: {}", e))?;

    // Check status code
    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Perplexity API error ({}): {}", status, error_text));
    }

    // Parse response
    let perplexity_response: PerplexityResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Perplexity response: {}", e))?;

    // Extract content
    let content = perplexity_response
        .choices
        .first()
        .ok_or_else(|| "No response from Perplexity API".to_string())?
        .message
        .content
        .clone();

    // Clean JSON from potential markdown code blocks
    let json_content = if content.contains("```json") {
        content
            .split("```json")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(&content)
            .trim()
    } else if content.contains("```") {
        content
            .split("```")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(&content)
            .trim()
    } else {
        content.trim()
    };

    // Parse the AI response as JSON
    let analysis: PackageAnalysis = serde_json::from_str(json_content)
        .map_err(|e| format!("Failed to parse AI response as JSON: {}. Response was: {}", e, json_content))?;

    // Validate risk category
    match analysis.risk_category.as_str() {
        "Safe" | "Caution" | "Expert" | "Dangerous" => Ok(analysis),
        _ => {
            let mut fixed_analysis = analysis;
            fixed_analysis.risk_category = "Caution".to_string();
            Ok(fixed_analysis)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Run manually with: cargo test -- --ignored
    async fn test_analyze_package() {
        // Set API key for testing
        env::set_var("PERPLEXITY_API_KEY", "your-test-key-here");
        
        let result = analyze_package("com.miui.analytics").await;
        match result {
            Ok(analysis) => {
                println!("Analysis: {:#?}", analysis);
                assert!(!analysis.summary.is_empty());
                assert!(["Safe", "Caution", "Expert", "Dangerous"]
                    .contains(&analysis.risk_category.as_str()));
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
}

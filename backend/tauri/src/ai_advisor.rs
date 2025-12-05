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
        r#"You are an Android package analysis expert. Analyze package: {}

Return ONLY valid JSON (no markdown, no explanation):
{{
  "packageName": "{}",
  "summary": "Brief description in plain English",
  "purpose": "What this package does in Android",
  "dependencies": [],
  "safeToRemove": false,
  "riskCategory": "Caution",
  "consequences": ["Potential issues if removed"],
  "userReports": ["Based on available information or 'No reports found'"],
  "technicalDetails": "Technical explanation of the package",
  "bestCase": "If safe to remove: improved performance/privacy",
  "worstCase": "Potential system instability or feature loss"
}}

Risk categories:
- Safe: Bloatware, ads, telemetry
- Caution: Vendor features, affects user experience
- Expert: System services with alternatives
- Dangerous: Core Android components

If uncertain about the package, use "Caution" and provide general analysis. Output JSON only."#,
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

    // Clean JSON from potential markdown code blocks or extra text
    let json_content = if content.contains("```json") {
        // Extract from ```json...``` blocks
        content
            .split("```json")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(&content)
            .trim()
    } else if content.contains("```") {
        // Extract from ```...``` blocks
        content
            .split("```")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(&content)
            .trim()
    } else {
        // Try to find JSON by looking for { and }
        let start = content.find('{');
        let end = content.rfind('}');
        
        match (start, end) {
            (Some(s), Some(e)) if s < e => &content[s..=e],
            _ => content.trim()
        }
    };

    println!("Extracted JSON content: {}", json_content);

    // Parse the AI response as JSON
    let analysis: PackageAnalysis = match serde_json::from_str(json_content) {
        Ok(parsed) => parsed,
        Err(e) => {
            // If JSON parsing fails, provide a fallback analysis
            eprintln!("JSON parse error: {}. Content: {}", e, json_content);
            
            PackageAnalysis {
                package_name: package_name.to_string(),
                summary: format!("Unable to analyze {}. Consider researching online or proceeding with caution.", package_name),
                purpose: "Analysis unavailable - API returned unexpected format".to_string(),
                dependencies: vec![],
                safe_to_remove: false,
                risk_category: "Caution".to_string(),
                consequences: vec!["Unknown - research before removing".to_string()],
                user_reports: vec!["No analysis available - check XDA forums or Android community".to_string()],
                technical_details: format!("AI response could not be parsed. Raw response: {}", 
                    if json_content.len() > 150 { 
                        format!("{}...", &json_content[..150]) 
                    } else { 
                        json_content.to_string() 
                    }),
                best_case: "System remains stable".to_string(),
                worst_case: "Potential feature loss or system instability".to_string(),
            }
        }
    };

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

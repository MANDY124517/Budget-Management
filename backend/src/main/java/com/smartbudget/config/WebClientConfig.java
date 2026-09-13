package com.smartbudget.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${app.analytics.url:http://localhost:8001}")
    private String analyticsServiceUrl;

    @Bean
    public WebClient analyticsWebClient() {
        return WebClient.builder()
                .baseUrl(analyticsServiceUrl)
                .build();
    }
}

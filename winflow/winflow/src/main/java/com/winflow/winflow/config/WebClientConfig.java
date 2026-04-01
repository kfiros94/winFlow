package com.winflow.winflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    //Spring automatically pulls these values from the application.properties
    @Value("${odds.api.url}")
    private String apiUrl;

    @Bean
    public WebClient oddsWebClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .build();
    }
}

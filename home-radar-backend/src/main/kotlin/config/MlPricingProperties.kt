package com.home_radar.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "ml.pricing")
class MlPricingProperties {
    lateinit var forRent: ModelConfig
    lateinit var forSale: ModelConfig

    class ModelConfig {
        lateinit var url: String
        lateinit var model: String
    }
}
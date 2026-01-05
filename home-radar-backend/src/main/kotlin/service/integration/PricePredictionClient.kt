package com.home_radar.service.integration

import com.home_radar.config.MlPricingProperties
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.web.request.PricePredictionModelRequest
import com.home_radar.web.response.PricePredictionModelResponse
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class PricePredictionClient(
    private val restTemplate: RestTemplate,
    private val config: MlPricingProperties
) {

    fun predict(
        request: PricePredictionModelRequest
    ): PricePredictionModelResponse {

        val modelConfig = when (request.category) {
            PropertyCategory.FOR_RENT -> config.forRent
            PropertyCategory.FOR_SALE -> config.forSale
        }

        val response = restTemplate.postForObject(
            "${modelConfig.url}?category=${request.category}",
            request,
            PricePredictionModelResponse::class.java
        )

        return response?.copy(
            modelType = modelConfig.model
        ) ?: throw IllegalStateException("ML service returned null response")
    }
}

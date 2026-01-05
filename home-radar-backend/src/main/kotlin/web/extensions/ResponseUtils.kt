package com.home_radar.web.extensions

import com.home_radar.domain.*
import com.home_radar.domain.dto.SubscriptionDto
import com.home_radar.web.request.PricePredictionModelRequest
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.response.*

fun Property.toResponse() = PropertyResponse(
    id = id,
    title = title,
    latitude = latitude,
    longitude = longitude,
    category = category,
    description = description,
    address = address,
    contactNumber = contactNumber,
    parking = parking,
    wifi = wifi,
    balcony = balcony,
    squareMeters = squareMeters,
    heating = heating,
    type = type,
    floor = floor,
    elevator = elevator!!,
    numberOfRooms = numberOfRooms,
    bathrooms = bathrooms,
    bedrooms = bedrooms,
    externalImageUrl = externalImageUrl,
    internalImageId = internalImageId,
    neighborhood = neighborhood,
    price = price,
    pricePrediction = pricePrediction?.predictedPrice,
    yearBuilt = yearBuilt,
    ownerId = owner?.id ?: 0
)

fun PropertyCreateRequest.toPricePredictionModelRequest(): PricePredictionModelRequest {
    return PricePredictionModelRequest(
        category = this.category,
        square_meters = this.squareMeters.toInt(),
        floor = this.floor,
        parking = this.parking,
        wifi = this.wifi,
        balcony = this.balcony,
        elevator = this.elevator,
        heating = this.heating.name,
        type = this.type.name,
        neighborhood = this.neighborhood ?: "Unknown",
        lat = this.latitude,
        lng = this.longitude,
        number_of_rooms = this.numberOfRooms,
        year_built = this.yearBuilt,
        bedrooms = this.bedrooms,
        bathrooms = this.bathrooms
    )
}

fun Property.toSimpleResponse() = PropertySimpleResponse(
    id = id,
    title = title,
    address = address,
    neighborhood = neighborhood,
    category = category,
    type = type,
    price = price
)

fun PerkType.toResponse() = PerkTypeResponse(
    id = id,
    name = name,
    description = description,
    defaultPerkTypeWeight = defaultPerkTypeWeight,
    iconImageId = iconImageId
)

fun Perk.toResponse() = PerkResponse(
    id = id,
    title = title,
    latitude = latitude,
    longitude = longitude,
    perkType = perkType.toResponse(),
    openingHours = openingHours
)

fun UserPreference.toResponse(): UserPreferenceResponse {
    return UserPreferenceResponse(
        radius = this.radius,
        weightsBalance = this.weightsBalance,
        perkPreferences = this.perkPreferences.map { (perkType, weight) ->
            PerkWeightResponse(perkType, weight)
        }
    )
}

fun Subscription.toDto(): SubscriptionDto {
    return SubscriptionDto(
        id = id,
        userId = userId,
        planType = planType.name,
        status = status.name,
        startDate = startDate.toString(),
        endDate = endDate?.toString()
    )
}

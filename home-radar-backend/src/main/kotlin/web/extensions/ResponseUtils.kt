package com.home_radar.web.extensions

import com.home_radar.domain.Perk
import com.home_radar.domain.PerkType
import com.home_radar.domain.Property
import com.home_radar.domain.UserPreference
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
    yearBuilt = yearBuilt,
    ownerId = owner?.id ?: 0
)

fun PerkType.toResponse() = PerkTypeResponse(
    id = id,
    name = name,
    description = description,
    defaultPerkTypeWeight = defaultPerkTypeWeight
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

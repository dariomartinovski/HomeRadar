package com.home_radar.web.extensions

import com.home_radar.domain.Perk
import com.home_radar.domain.Property
import com.home_radar.domain.UserPreference
import com.home_radar.web.response.PerkResponse
import com.home_radar.web.response.PerkWeightResponse
import com.home_radar.web.response.PropertyResponse
import com.home_radar.web.response.UserPreferenceResponse

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
    imageUrl = imageUrl,
    neighborhood = neighborhood,
    price = price,
    yearBuilt = yearBuilt
)

fun Perk.toResponse() = PerkResponse(
    id = id,
    title = title,
    latitude = latitude,
    longitude = longitude,
    type = type.name,
    openingHours = openingHours
)

fun UserPreference.toResponse(): UserPreferenceResponse {
    return UserPreferenceResponse(
        radius = this.radius,
        perkPreferences = this.perkPreferences.map { (perkType, weight) ->
            PerkWeightResponse(perkType, weight)
        }
    )
}

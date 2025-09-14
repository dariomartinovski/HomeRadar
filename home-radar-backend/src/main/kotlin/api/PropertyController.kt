package com.home_radar.api

import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.service.LocationScoreManagingService
import com.home_radar.service.PropertyService
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.response.PropertyResponse
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@CrossOrigin
@RestController
@RequestMapping("/api/properties")
class PropertyController(
    private val propertyService: PropertyService,
    private val locationScoreManagingService: LocationScoreManagingService
) {
    @GetMapping
    fun getAll() = propertyService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = propertyService.findById(id)

    @GetMapping("/filter")
    fun filter(
        @RequestParam(required = false) title: String?,
        @RequestParam(required = false) area: String?,
        @RequestParam(required = false) propertyCategory: PropertyCategory?,
        @RequestParam(required = false) priceMin: Double?,
        @RequestParam(required = false) priceMax: Double?,
        @RequestParam(required = false) rooms: Int?,
        @RequestParam(required = false) bedrooms: Int?,
        @RequestParam(required = false) bathrooms: Int?,
        @RequestParam(required = false) size: Double?,
        @RequestParam(required = false) yearBuilt: Int?,
        @RequestParam(required = false) parking: Boolean?,
        @RequestParam(required = false) balcony: Boolean?,
        @RequestParam(required = false) elevator: Boolean?
    ) = propertyService.findFiltered(
        title, area, propertyCategory, priceMin, priceMax, rooms, bedrooms,
        bathrooms, size, yearBuilt, parking, balcony, elevator
    )

    @GetMapping("/areas")
    fun findAreas() = propertyService.findAllAreas()

    @GetMapping("/circle/score")
    fun getSelectedCircleScore(@RequestParam latitude: Double,
                               @RequestParam longitude: Double)
    = locationScoreManagingService.calculateAndPersistScore(latitude, longitude)

    @PostMapping(consumes = ["multipart/form-data"])
    fun create(@RequestPart("request") request: PropertyCreateRequest, @RequestPart("image", required = false) image: MultipartFile?): PropertyResponse =  propertyService.create(request, image)
}

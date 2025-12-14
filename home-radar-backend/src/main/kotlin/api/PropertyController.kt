package com.home_radar.api

import com.home_radar.service.LocationScoreManagingService
import com.home_radar.service.PropertyService
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.request.PropertyFilterRequest
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
    fun getAll() = propertyService.findAll().map { it.toResponse() }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = propertyService.findById(id).toResponse()

    @GetMapping("/filter")
    fun filter(@ModelAttribute filter: PropertyFilterRequest) =
        propertyService.findFiltered(filter).map { it.toResponse() }

    @GetMapping("/areas")
    fun findAreas() = propertyService.findAllAreas()

    @GetMapping("/circle/score")
    fun getSelectedCircleScore(
        @RequestParam latitude: Double,
        @RequestParam longitude: Double,
        @ModelAttribute filter: PropertyFilterRequest
    ) = locationScoreManagingService.calculateAndPersistScore(latitude, longitude, filter)

    @PostMapping(consumes = ["multipart/form-data"])
    fun create(
        @RequestPart("request") request: PropertyCreateRequest,
        @RequestPart("image", required = false) image: MultipartFile?
    ): PropertyResponse = propertyService.create(request, image)
}

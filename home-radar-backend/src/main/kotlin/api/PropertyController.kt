package com.home_radar.api

import com.home_radar.service.LocationScoreManagingService
import com.home_radar.service.PropertyService
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.response.PropertyResponse
import org.springframework.web.bind.annotation.*

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
    fun filter(@RequestParam(required = false) title: String?,
               @RequestParam(required = false) area: String?)
    = propertyService.findFiltered(title, area)

    @GetMapping("/areas")
    fun findAreas() = propertyService.findAllAreas();

    @GetMapping("/circle/score")
    fun getSelectedCircleScore(@RequestParam latitude: Double,
                               @RequestParam longitude: Double)
    = locationScoreManagingService.calculateAndPersistScore(latitude, longitude)

        @PostMapping
    fun create(@RequestBody request: PropertyCreateRequest): PropertyResponse =  propertyService.create(request)
}

package com.home_radar.api

import com.home_radar.service.PropertyService
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/properties")
class PropertyController(
    private val propertyService: PropertyService
) {
    @GetMapping
    fun getAll() = propertyService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = propertyService.findById(id)
}

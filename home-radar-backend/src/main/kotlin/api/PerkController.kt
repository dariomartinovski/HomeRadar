package com.home_radar.api

import com.home_radar.service.PerkService
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/perks")
class PerkController(
    val perkService: PerkService
) {
    @GetMapping
    fun findAllPerks() = perkService.findAllPerks()

    @GetMapping("/filter")
    fun findAllPerksFiltered(@RequestParam(required = false) categories: List<String>?)
        = perkService.findAllPerksFiltered(categories)

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long) = perkService.findPerkById(id)

    @GetMapping("/categories")
    fun findAllCategories() = perkService.findAllCategories()
}
package com.home_radar.api

import com.home_radar.service.PerkService
import com.home_radar.web.request.CreatePerkRequest
import com.home_radar.web.response.PerkResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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

    @PostMapping
    fun createPerk(@RequestBody request: CreatePerkRequest): ResponseEntity<PerkResponse> {
        return try {
            val perk = perkService.createPerk(request)
            ResponseEntity.status(HttpStatus.CREATED).body(perk)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }
}
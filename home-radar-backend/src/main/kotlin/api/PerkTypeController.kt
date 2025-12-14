package com.home_radar.api

import com.home_radar.web.request.CreatePerkTypeRequest
import com.home_radar.service.PerkTypeService
import com.home_radar.web.response.PerkTypeResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@CrossOrigin
@RestController
@RequestMapping("/api/perk-types")
class PerkTypeController(
    private val perkTypeService: PerkTypeService
) {

    @GetMapping
    fun getAllPerkTypes(): ResponseEntity<List<PerkTypeResponse>> {
        val perkTypes = perkTypeService.getAllPerkTypes()
        return ResponseEntity.ok(perkTypes)
    }

    @GetMapping("/{id}")
    fun getPerkTypeById(@PathVariable id: Long): ResponseEntity<PerkTypeResponse> {
        return try {
            val perkType = perkTypeService.getPerkTypeById(id)
            ResponseEntity.ok(perkType)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping(consumes = ["multipart/form-data"])
    fun createPerkType(@RequestPart request: CreatePerkTypeRequest,
                       @RequestPart("image") image: MultipartFile
    ): ResponseEntity<PerkTypeResponse> {
        return try {
            val perkType = perkTypeService.createPerkType(request, image)
            ResponseEntity.status(HttpStatus.CREATED).body(perkType)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deletePerkType(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            perkTypeService.deletePerkType(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }
}
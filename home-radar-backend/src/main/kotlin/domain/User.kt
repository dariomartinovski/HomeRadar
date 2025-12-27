package com.home_radar.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.home_radar.domain.dto.SubscriptionDto
import com.home_radar.domain.dto.UserDto
import com.home_radar.domain.dto.UserSimpleDto
import com.home_radar.domain.enum.UserRole
import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

@Entity
@Table(name = "radar_users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    val userPassword: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val role: UserRole = UserRole.CLIENT,

    @Column(nullable = false)
    val firstName: String,

    @Column(nullable = false)
    val lastName: String,

    @Column(nullable = false, unique = true)
    val phoneNumber: String,

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "owner", cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JsonIgnore
    var ownedProperties: MutableList<Property> = mutableListOf(),

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    var propertyPreferences: MutableList<UserPropertyPreference> = mutableListOf()
) : UserDetails {

    fun getFullName() = "$firstName $lastName"

    fun toDto(): UserDto {
        return UserDto(
            id = this.id,
            firstName = this.firstName,
            lastName = this.lastName,
            email = this.email,
            phoneNumber = this.phoneNumber,
            userRole = this.role.toString(),
            ownedProperties = this.ownedProperties
        )
    }

    fun toSimpleDto(subscription: SubscriptionDto): UserSimpleDto {
        return UserSimpleDto(
            id = this.id,
            firstName = this.firstName,
            lastName = this.lastName,
            email = this.email,
            phoneNumber = this.phoneNumber,
            role = this.role.name,
            subscription = subscription,
            propertyPreferences = this.propertyPreferences.map { it.toSimpleDto() }
        )
    }

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return listOf(SimpleGrantedAuthority("ROLE_${role.name}"))
    }

    override fun getPassword(): String {
        return userPassword
    }

    override fun getUsername(): String {
        return email
    }

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true

    override fun toString(): String {
        return "User(id=$id, email='$email', firstName='$firstName', lastName='$lastName', phoneNumber='$phoneNumber', role=$role)"
    }
}
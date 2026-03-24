package com.omniguard.config;

import com.omniguard.model.*;
import com.omniguard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Seeds the MongoDB database on startup with:
 *  - 5 demo users (matching the frontend DEMO_USERS)
 *  - 4 initial incidents
 *  - 3 initial alerts
 *  - 5 initial resources
 *  - 5 initial tasks
 *
 *  Safe to run multiple times — checks existence before inserting.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository       userRepo;
    private final IncidentRepository   incidentRepo;
    private final AlertRepository      alertRepo;
    private final ResourceRepository   resourceRepo;
    private final TaskRepository       taskRepo;
    private final BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) {
        seedUsers();
        if (incidentRepo.count() == 0) seedIncidents();
        if (alertRepo.count()    == 0) seedAlerts();
        if (resourceRepo.count() == 0) seedResources();
        if (taskRepo.count()     == 0) seedTasks();
        log.info("✅ DataSeeder complete — DB ready");
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    private void seedUsers() {
        seedUser("u1", "collector@ndma.gov", "admin123",   "ADMIN",     "Dist. Collector Sharma", "S", "IAS-2019");
        seedUser("u2", "officer@ndma.gov",   "officer123", "OFFICER",   "Dy. Collector Priya",    "P", "OFC-007");
        seedUser("u3", "rescue@ndrf.gov",    "rescue123",  "RESCUE",    "NDRF Lt. Arjun Singh",   "A", "NDRF-042");
        seedUser("u4", "citizen@gmail.com",  "user123",    "CITIZEN",   "Ravi Kumar",             "R", null);
        seedUser("u5", "volunteer@nss.org",  "vol123",     "VOLUNTEER", "Meena Devi",             "M", "VOL-NSS");
    }

    private void seedUser(String id, String username, String rawPassword,
                          String role, String name, String avatar, String badge) {
        if (userRepo.existsByUsername(username)) return;
        User u = User.builder()
                .id(id)
                .username(username)
                .password(encoder.encode(rawPassword))
                .role(role).name(name).avatar(avatar)
                .district("Chennai District")
                .badge(badge)
                .build();
        userRepo.save(u);
        log.info("Seeded user: {} ({})", username, role);
    }

    // ── Incidents ─────────────────────────────────────────────────────────────

    private void seedIncidents() {
        incidentRepo.saveAll(List.of(
            Incident.builder()
                .id("inc-001").type("Flood").severity("HIGH")
                .location("Anna Nagar, Chennai")
                .coordinates(new double[]{80.21, 13.085}) // [lng, lat]
                .description("Major flooding in residential area. 200+ families displaced.")
                .reportedBy("u4").reporterName("Ravi Kumar")
                .status("ACKNOWLEDGED").assignedOfficerId("u2")
                .timestamp(Instant.now().minusSeconds(3600))
                .build(),
            Incident.builder()
                .id("inc-002").type("Cyclone").severity("CRITICAL")
                .location("Marina Beach, Chennai")
                .coordinates(new double[]{80.28, 13.05})
                .description("Cyclonic storm approaching coastline. Category 3.")
                .reportedBy("u2").reporterName("Dy. Collector Priya")
                .status("REPORTED").assignedOfficerId(null)
                .timestamp(Instant.now().minusSeconds(7200))
                .build(),
            Incident.builder()
                .id("inc-003").type("Building Collapse").severity("CRITICAL")
                .location("T. Nagar, Chennai")
                .coordinates(new double[]{80.23, 13.04})
                .description("Old building partially collapsed. Residents trapped.")
                .reportedBy("u4").reporterName("Ravi Kumar")
                .status("REPORTED")
                .timestamp(Instant.now().minusSeconds(1800))
                .build(),
            Incident.builder()
                .id("inc-004").type("Fire").severity("MEDIUM")
                .location("Guindy Industrial Area")
                .coordinates(new double[]{80.21, 13.01})
                .description("Fire at warehouse. Fire department on scene.")
                .reportedBy("u5").reporterName("Meena Devi")
                .status("RESOLVED").assignedOfficerId("u2")
                .timestamp(Instant.now().minusSeconds(10800))
                .build()
        ));
        log.info("Seeded 4 incidents");
    }

    // ── Alerts ────────────────────────────────────────────────────────────────

    private void seedAlerts() {
        alertRepo.saveAll(List.of(
            Alert.builder().id("al-001").type("CRITICAL")
                .title("Cyclone Warning")
                .message("Cyclone MANDOUS approaching Chennai coast. Expected landfall at 0300 hrs. All coastal residents evacuate immediately.")
                .sentBy("u1").sent(true).targetArea("Chennai Coast")
                .timestamp(Instant.now())
                .build(),
            Alert.builder().id("al-002").type("HIGH")
                .title("Flood Alert — Zone A")
                .message("Water level rising in Adyar River. Zones A, B, C on high alert. Expect crests by 1800 hrs.")
                .sentBy("u2").sent(true).targetArea("Adyar, Chennai")
                .timestamp(Instant.now().minusSeconds(1800))
                .build(),
            Alert.builder().id("al-003").type("MEDIUM")
                .title("Relief Camp Open")
                .message("Relief camp operational at Washermanpet Government School. Capacity: 500. Food, water, medical aid available.")
                .sentBy("u2").sent(true).targetArea("Washermanpet")
                .timestamp(Instant.now().minusSeconds(3600))
                .build()
        ));
        log.info("Seeded 3 alerts");
    }

    // ── Resources ─────────────────────────────────────────────────────────────

    private void seedResources() {
        resourceRepo.saveAll(List.of(
            Resource.builder().id("res-001").name("NDRF Battalion Alpha")
                .type("Rescue Team").available(true)
                .location("Anna Nagar Base").coordinates(new double[]{80.21, 13.085})
                .capacity(40).contact("+91-44-28293000").build(),
            Resource.builder().id("res-002").name("Govt. Medical Camp")
                .type("Medical").available(true)
                .location("Washermanpet School").coordinates(new double[]{80.285, 13.115})
                .capacity(200).contact("+91-44-25223000").build(),
            Resource.builder().id("res-003").name("Relief Food Store")
                .type("Food").available(true)
                .location("Central Warehouse").coordinates(new double[]{80.25, 13.07})
                .capacity(5000).contact("+91-44-25420001").build(),
            Resource.builder().id("res-004").name("Rescue Boats (×8)")
                .type("Equipment").available(false)
                .location("Anna Nagar Depot").coordinates(new double[]{80.209, 13.088})
                .capacity(8).contact("+91-44-28297000").build(),
            Resource.builder().id("res-005").name("Emergency Shelter")
                .type("Shelter").available(true)
                .location("Anna Nagar Stadium").coordinates(new double[]{80.207, 13.091})
                .capacity(1000).contact("+91-44-26203000").build()
        ));
        log.info("Seeded 5 resources");
    }

    // ── Tasks ─────────────────────────────────────────────────────────────────

    private void seedTasks() {
        taskRepo.saveAll(List.of(
            Task.builder().id("task-001")
                .title("Evacuate Anna Nagar Sector 3")
                .description("Deploy rescue boats and evacuate 50 families from flood zone.")
                .priority("HIGH").status("IN_PROGRESS")
                .incidentId("inc-001").assignedTo("u3").assignedBy("u2")
                .notes("Boats deployed. 30 families moved.")
                .createdAt(Instant.now().minusSeconds(3000))
                .escalateAt(Instant.now().plusSeconds(3600))
                .build(),
            Task.builder().id("task-002")
                .title("Set up Relief Camp — Washermanpet")
                .description("Coordinate with NGOs to establish food and shelter camp.")
                .priority("HIGH").status("PENDING")
                .incidentId("inc-001").assignedTo("u5").assignedBy("u2")
                .notes("")
                .createdAt(Instant.now().minusSeconds(2000))
                .escalateAt(Instant.now().plusSeconds(7200))
                .build(),
            Task.builder().id("task-003")
                .title("Coast Guard Alert — Marina Beach")
                .description("Issue evacuation orders for 1km coastal belt.")
                .priority("HIGH").status("PENDING")
                .incidentId("inc-002").assignedTo(null).assignedBy("u2")
                .notes("")
                .createdAt(Instant.now().minusSeconds(6000))
                .escalateAt(Instant.now().plusSeconds(1800))
                .build(),
            Task.builder().id("task-004")
                .title("Search & Rescue — T. Nagar Collapse")
                .description("NDRF team to conduct immediate search and rescue operations.")
                .priority("HIGH").status("IN_PROGRESS")
                .incidentId("inc-003").assignedTo("u3").assignedBy("u1")
                .notes("Team on ground. 3 survivors found.")
                .createdAt(Instant.now().minusSeconds(1700))
                .escalateAt(Instant.now().plusSeconds(900))
                .build(),
            Task.builder().id("task-005")
                .title("Medical Team — T. Nagar")
                .description("Dispatch medical team with trauma equipment.")
                .priority("MEDIUM").status("COMPLETED")
                .incidentId("inc-003").assignedTo("u5").assignedBy("u1")
                .notes("Medical team arrived. 2 critical, 5 stable.")
                .createdAt(Instant.now().minusSeconds(1600))
                .escalateAt(Instant.now().plusSeconds(3600))
                .build()
        ));
        log.info("Seeded 5 tasks");
    }
}

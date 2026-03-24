package com.omniguard.service;

import com.omniguard.model.ContactMessage;
import com.omniguard.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    /**
     * Saves a contact form submission to MongoDB.
     */
    public ContactMessage save(ContactMessage message) {
        ContactMessage saved = contactMessageRepository.save(message);
        log.info("Contact message saved: id={}, from={}", saved.getId(), saved.getEmail());
        return saved;
    }

    public java.util.List<ContactMessage> getAll() {
        return contactMessageRepository.findAll();
    }
}

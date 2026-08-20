/**
 * Portfolio Website JavaScript
 * 
 * This file handles the interactive functionality of the portfolio website:
 * 1. Mobile navigation menu toggle
 * 2. Contact form submission via EmailJS
 * 
 * Usage:
 * - Include this script at the end of your HTML body
 * - Ensure EmailJS library is loaded if using the contact form feature
 */

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener("DOMContentLoaded", function() {
  
  // ===== MOBILE MENU TOGGLE =====
  // Handles the hamburger menu for mobile/tablet devices
  const menuIcon = document.querySelector('.menu-icon');
  const navList = document.querySelector('.nav ul');
  
  // Toggle the mobile menu when hamburger icon is clicked
  menuIcon.addEventListener('click', () => {
    navList.classList.toggle('active');
  });
  
  // Auto-close mobile menu when a navigation link is clicked
  // This provides better UX by closing the menu after navigation
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (navList.classList.contains('active')) {
        navList.classList.remove('active');
      }
    });
  });
  
  // ===== CONTACT FORM - EMAILJS INTEGRATION =====
  // Handles contact form submission using EmailJS service
  // To enable this feature:
  // 1. Sign up at https://www.emailjs.com/
  // 2. Create an email service and template
  // 3. Replace the placeholder values below with your actual credentials
  
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      // Prevent default form submission (which would refresh the page)
      event.preventDefault();
      
      // Initialize EmailJS with your public key
      // Get this from your EmailJS dashboard
      emailjs.init('YOUR_PUBLIC_KEY');
      
      // Send the form data via EmailJS
      // Parameters: serviceID, templateID, form element
      emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
        .then(() => {
          // Success: Show confirmation and reset form
          alert('Message sent successfully!');
          contactForm.reset();
        }, (error) => {
          // Error: Show error message
          alert('Failed to send message. Please try again.');
          console.error('EmailJS error:', error);
        });
    });
  }
});

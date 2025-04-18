document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const form = document.getElementById("profileCompletionForm");
  const steps = document.querySelectorAll(".form-step");
  const progressFill = document.querySelector(".progress-fill");
  const stepIndicators = document.querySelectorAll(".step");
  const nextButtons = document.querySelectorAll(".next-btn");
  const prevButtons = document.querySelectorAll(".prev-btn");
  const submitButton = document.querySelector(".submit-btn");
  const successModal = document.getElementById("successModal");
  const closeModal = document.querySelector(".close-modal");

  // Photo upload elements
  const photoUpload = document.getElementById("photoUpload");
  const photoPreview = document.getElementById("photoPreview");
  const summaryPhoto = document.getElementById("summaryPhoto");

  // Skills management elements
  const skillInput = document.getElementById("skillInput");
  const addSkillBtn = document.getElementById("addSkillBtn");
  const skillsContainer = document.getElementById("skillsContainer");
  const summarySkills = document.getElementById("summarySkills");

  // Specialty field
  const specialtySelect = document.getElementById("specialty");
  const otherSpecialtyGroup = document.getElementById("otherSpecialtyGroup");

  // Current step tracking
  let currentStep = 1;
  const totalSteps = steps.length;

  // Initialize progress
  updateProgress();

  // Event Listeners
  // Next button click
  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep(currentStep)) {
        if (currentStep === totalSteps - 1) {
          // Update summary before showing final step
          updateSummary();
        }
        goToStep(currentStep + 1);
      }
    });
  });

  // Previous button click
  prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToStep(currentStep - 1);
    });
  });

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!document.getElementById("termsAgreement").checked) {
      alert("يرجى الموافقة على الشروط والأحكام للمتابعة");
      return;
    }

    // Collect form data
    const formData = new FormData(form);

    // Add skills to form data
    const skills = [];
    document.querySelectorAll(".skill-tag").forEach((tag) => {
      skills.push(tag.textContent.trim());
    });
    formData.append("skills", JSON.stringify(skills));

    // In a real application, you would send this data to your server
    console.log("Form submitted with data:", Object.fromEntries(formData));

    // Show success modal
    successModal.style.display = "flex";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    successModal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === successModal) {
      successModal.style.display = "none";
    }
  });

  // Photo upload handling
  photoUpload.addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const fileType = file.type;
      if (!fileType.match("image.*")) {
        alert("يرجى اختيار ملف صورة صالح");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة كبير جدًا. الحد الأقصى هو 5 ميجابايت");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        photoPreview.src = e.target.result;
        summaryPhoto.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Skills management
  addSkillBtn.addEventListener("click", function () {
    addSkill();
  });

  skillInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  });

  // Specialty change handler
  specialtySelect.addEventListener("change", function () {
    if (this.value === "other") {
      otherSpecialtyGroup.style.display = "block";
    } else {
      otherSpecialtyGroup.style.display = "none";
    }
  });

  // Functions
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Hide all steps
    steps.forEach((s) => (s.style.display = "none"));

    // Show current step
    steps[step - 1].style.display = "block";

    // Update current step
    currentStep = step;

    // Update progress
    updateProgress();
  }

  function updateProgress() {
    // Update progress bar
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      if (index + 1 < currentStep) {
        indicator.classList.add("completed");
        indicator.classList.remove("active");
        indicator.querySelector(".step-number").innerHTML =
          '<i class="fas fa-check"></i>';
      } else if (index + 1 === currentStep) {
        indicator.classList.add("active");
        indicator.classList.remove("completed");
        indicator.querySelector(".step-number").textContent = index + 1;
      } else {
        indicator.classList.remove("active", "completed");
        indicator.querySelector(".step-number").textContent = index + 1;
      }
    });
  }

  function validateStep(step) {
    let isValid = true;

    // Get all required fields in current step
    const currentStepElement = document.querySelector(
      `.form-step[data-step="${step}"]`
    );
    const requiredFields = currentStepElement.querySelectorAll("[required]");

    // Check each required field
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "red";
        isValid = false;
      } else {
        field.style.borderColor = "";
      }
    });

    // Special validation for step 2 (skills)
    if (step === 2) {
      const skillTags = document.querySelectorAll(".skill-tag");
      if (skillTags.length < 3) {
        alert("يرجى إضافة 3 مهارات على الأقل");
        isValid = false;
      }
    }

    // Special validation for step 3 (photo)
    if (step === 3) {
      if (photoPreview.src.includes("default-avatar.png")) {
        alert("يرجى تحميل صورة شخصية");
        isValid = false;
      }
    }

    if (!isValid) {
      alert("يرجى ملء جميع الحقول المطلوبة");
    }

    return isValid;
  }

  function addSkill() {
    const skill = skillInput.value.trim();

    if (!skill) return;

    // Check if skill already exists
    const existingSkills = Array.from(
      document.querySelectorAll(".skill-tag")
    ).map((tag) => tag.textContent.trim());

    if (existingSkills.includes(skill)) {
      alert("هذه المهارة موجودة بالفعل");
      return;
    }

    // Create skill tag
    const skillTag = document.createElement("div");
    skillTag.className = "skill-tag";
    skillTag.innerHTML = `
          ${skill}
          <span class="remove-skill"><i class="fas fa-times"></i></span>
      `;

    // Add remove event
    const removeBtn = skillTag.querySelector(".remove-skill");
    removeBtn.addEventListener("click", function () {
      skillTag.remove();
    });

    // Add to container
    skillsContainer.appendChild(skillTag);

    // Clear input
    skillInput.value = "";
  }

  function updateSummary() {
    // Update personal info
    document.getElementById("summaryName").textContent =
      document.getElementById("fullName").value;
    document.getElementById("summaryPhone").textContent =
      document.getElementById("phone").value;

    // Update specialty
    const specialty = document.getElementById("specialty");
    let specialtyText = specialty.options[specialty.selectedIndex].text;

    if (specialty.value === "other") {
      specialtyText = document.getElementById("otherSpecialty").value;
    }

    document.getElementById("summarySpecialty").textContent = specialtyText;

    // Update skills
    summarySkills.innerHTML = "";
    document.querySelectorAll(".skill-tag").forEach((tag) => {
      const skill = document.createElement("div");
      skill.className = "summary-skill";
      skill.textContent = tag.textContent.trim();
      summarySkills.appendChild(skill);
    });
  }
});

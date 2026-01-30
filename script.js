(function(){
  "use strict";

  /* WebP Logic (Probe) */
  function canLoadImage(url){
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(true);
      im.onerror = () => resolve(false);
      const sep = url.includes("?") ? "&" : "?";
      im.src = url + sep + "probe=" + Date.now();
    });
  }
  async function hardenPictureWebp(){
    // Проверка поддержки WebP (по наличию файла имплантов)
    const probe = await canLoadImage("images/implants.webp");
    if(!probe){
      document.querySelectorAll('source[type="image/webp"]').forEach(s => s.remove());
      document.querySelectorAll('[data-full-webp]').forEach(el => el.removeAttribute("data-full-webp"));
    }
  }
  hardenPictureWebp();

  /* Menu Drawer Logic */
  const root = document.documentElement;
  const burger = document.getElementById("burger");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");
  const closeBtn = document.getElementById("drawerClose");
  // Ссылки меню закрывают меню только если это якорь (#), а не переход на новую страницу
  const menuLinks = drawer.querySelectorAll('a[href^="#"]');

  function openMenu(){
    root.classList.add("isMenuOpen");
    drawer.setAttribute("aria-hidden","false");
    overlay.setAttribute("aria-hidden","false");
  }
  function closeMenu(){
    root.classList.remove("isMenuOpen");
    drawer.setAttribute("aria-hidden","true");
    overlay.setAttribute("aria-hidden","true");
  }
  if(burger) burger.addEventListener("click", openMenu);
  if(overlay) overlay.addEventListener("click", closeMenu);
  if(closeBtn) closeBtn.addEventListener("click", closeMenu);
  menuLinks.forEach(a => a.addEventListener("click", closeMenu));

  /* Reveal Animation */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    });
  }, {threshold: 0.1});
  revealEls.forEach(el => io.observe(el));

  /* Full-view Image Modal */
  const imgModal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  function openImage(img){
    const webp = img.getAttribute("data-full-webp");
    const jpg = img.getAttribute("data-full-jpg") || img.currentSrc || img.src;
    modalImg.src = webp || jpg;
    modalImg.alt = img.alt || "";
    if(modalTitle) modalTitle.textContent = img.alt || "";
    if(imgModal) {
      imgModal.setAttribute("aria-hidden","false");
      document.body.style.overflow = "hidden";
    }
  }
  function closeImage(){
    if(imgModal) imgModal.setAttribute("aria-hidden","true");
    modalImg.src = "";
    document.body.style.overflow = "";
  }

  // Делаем кликабельными только картинки с классом .zoomable
  // (На внутренних страницах фото может не быть ссылкой, или быть в шапке)
  const clickableImgs = document.querySelectorAll("img.zoomable");
  clickableImgs.forEach(im => {
    im.style.cursor = "zoom-in";
    im.addEventListener("click", (e) => {
      e.preventDefault(); // Если картинка внутри ссылки, не переходим
      openImage(im);
    });
  });

  if(imgModal) imgModal.addEventListener("click", (e) => {
    if(e.target === imgModal) closeImage();
  });
  if(modalClose) modalClose.addEventListener("click", closeImage);

  /* Contact Form Validation */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  function setError(fieldId, on){
    const el = document.getElementById(fieldId);
    if(el) on ? el.classList.add("hasError") : el.classList.remove("hasError");
  }

  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const msg = document.getElementById("message");

      if(name && name.value.trim().length < 2) { setError("fName", true); ok=false; } else setError("fName", false);
      if(email && !email.checkValidity()) { setError("fEmail", true); ok=false; } else setError("fEmail", false);
      if(phone && !phone.value) { setError("fPhone", true); ok=false; } else setError("fPhone", false);
      if(msg && msg.value.trim().length < 10) { setError("fMsg", true); ok=false; } else setError("fMsg", false);

      if(ok && status){
        status.textContent = "Message sent successfully!";
        form.reset();
      } else if(status) {
        status.textContent = "";
      }
    });
  }

})();

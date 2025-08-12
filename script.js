import { products, labelStyles } from './database/products.js';

const isMobile = window.matchMedia('(max-width: 767px)').matches;

// variables for list of products
const container = document.getElementById('products-list')
let currentPage = 1;
let productsPerPage = +document.getElementById('products-per-page').querySelector('.dropdown--active').textContent;
let lastLoadedProductId = 0;
let maxLoadedProductId = productsPerPage;

// variables for extended product
const extendedProductContainer = document.getElementById('product-extended');
const overlay = document.getElementById('overlay')

// fetching items from database
async function getProducts(page) {
    const response = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=${page}&pageSize=${productsPerPage}`);
    const data = await response.json();
    return data;
}

// function for rendering products
// 25 min
function renderProducts(products) {
    for (const product of products) {
        if (product.id > lastLoadedProductId && product.id <= maxLoadedProductId) {
            const elem = document.createElement('div');
            elem.classList.add('product');

            const img = document.createElement('img');
            img.classList.add('product__image');
            img.setAttribute('loading', 'lazy');
            img.setAttribute('alt', product.text);
            img.src = product.image;

            const id = document.createElement('p');
            id.classList.add('product__id');
            id.textContent = 'ID: ' + String(product.id).padStart(2, '0');

            elem.appendChild(img);
            elem.appendChild(id);

            container.appendChild(elem);

            elem.addEventListener('click', () => {
                showExtendedProduct(product.id, product.image);
            })

            lastLoadedProductId = product.id;
        }
    }
    currentPage++;
}

// function for creating banner in products list
// 30 min
function createProductsBanner() {
    const bannerPos = isMobile ? document.getElementsByClassName('product')[3] : document.getElementsByClassName('product')[4];

    let bannerEl = document.createElement('div')
    bannerEl.id = 'products-banner';
    bannerEl.classList.add('products__banner')

    const bannerText = "You'll look and feel like the champion."
    const link = ""

    const background = "../images/banner.jpg"
    const bgSize = '110%'
    const bgX = '0'
    const bgY = '47%'

    bannerEl.style.background = `url(${background}) 110% no-repeat`;
    bannerEl.style.backgroundSize = bgSize;
    bannerEl.style.backgroundPosition = `${bgX} ${bgY}`;

    bannerEl.innerHTML = `
        <div class="products__banner-header">
            <h2>FORMA'SINT.</h2>
            <p class="banner__text">${bannerText}</p>
        </div>
        <button class="banner__button">CHECK THIS OUT<img src="images/icons/arrow-small.svg" class="banner__button-icon"></button>
    `
    bannerPos.parentNode.insertBefore(bannerEl, bannerPos.nextSibling);
}

// function for showing/hiding extended view of product
// 25 min
function showExtendedProduct(id, img) {
    toggleExtendedProductVisibility();

    extendedProductContainer.querySelector('.product__id').textContent = 'ID: ' + String(id).padStart(2, '0');
    extendedProductContainer.querySelector('img').src = img;
}

document.getElementById('close-extended').addEventListener('click', () => {
    toggleExtendedProductVisibility();
})

function toggleExtendedProductVisibility() {
    extendedProductContainer.classList.toggle('hidden')
    overlay.classList.toggle('hidden')
}

// function for generating featured products
// 40 min
function createFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products').getElementsByClassName('swiper-wrapper')[0];

    products.forEach(product => {
        const productContainer = document.createElement('div');
        productContainer.classList.add('swiper-slide');

        const labelData = labelStyles[product.label];

        productContainer.innerHTML = `
            <div class="swiper-image-container">
                <img src="${product.img}" alt="${product.name}" class="product__image" loading="lazy">
                ${labelData ? `<p class="product__label ${labelData.class}">${labelData.text.toUpperCase()}</p>` : ''}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="heart-icon">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="swiper__slide-header">
                <h3 class="swiper__slide-title">${product.name}</h3>
                <p class="swiper__slide-price">${product.price}</p>
            </div>
        `;

        featuredContainer.appendChild(productContainer);
    });
}

// event listener for lazy loading of products list
let isLoading = false;
const trigger = document.getElementById('scroll-bottom-trigger');
// isLoading variable created to prevent from multiple products generation
// 4 hours

const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !isLoading) {
        isLoading = true;

        recalculateProductsPerView();

        const data = await getProducts(currentPage);
        renderProducts(data.data);

        if (lastLoadedProductId < maxLoadedProductId) {
            const data = await getProducts(currentPage);
            renderProducts(data.data);
        }

        isLoading = false;
    }
}, {
    root: null,
    rootMargin: '20px',
    threshold: 0.1
});

observer.observe(trigger);

function recalculateProductsPerView() {
    maxLoadedProductId = lastLoadedProductId + productsPerPage;
    currentPage = Math.ceil(lastLoadedProductId / productsPerPage)
}

document.getElementById('products-per-page').addEventListener('change', async (event) => {
    productsPerPage = +event.target.value;
    recalculateProductsPerView();
})

createFeaturedProducts();

// header scroll to sections
// 40 min
[...document.querySelectorAll('[data-nav-btn]')].forEach(btn => {
    btn.addEventListener('click', () => {
        const targetOffset = document.querySelector(`[data-section='${btn.dataset.navBtn}']`).offsetTop - 124;

        scrollTo({
            top: targetOffset,
            left: 0,
            behavior: "smooth",
        })

        if (btn.parentElement.parentElement.parentElement.classList.contains('header__menu-mobile--active')) burgerMenuBtns[0].click();
    })
})

// custom dropdown
// 2 hours
const dropdownOptions = [...document.getElementsByClassName('dropdown-option')];

dropdownOptions.forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('border--hidden');
        option.parentElement.classList.toggle('border--hidden');

        dropdownOptions.forEach(btn => {
            btn.classList.toggle('hidden-display');
        })

        if (!option.classList.contains('dropdown--active')) {
            option.parentElement.querySelector('.dropdown--active').classList.remove('dropdown--active');
            option.classList.add('dropdown--active');
            productsPerPage = +option.textContent;

            dropdownOptions.forEach(btn => {
                btn.classList.add('hidden-display');
            })

            // adding or removing border bottom of penultimate element of the custom dropdown
            dropdownOptions[dropdownOptions.length - 2].style.borderBottom = '';
            if (!option.nextElementSibling) {
                option.previousElementSibling.style.borderBottom = 'none';
            }
        }
    })
})

// header
const burgerMenuBtns = document.querySelectorAll('.header__burger');

burgerMenuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('menu-mobile').classList.toggle('header__menu-mobile--active');
        overlay.classList.toggle('hidden');
        document.querySelector('body').classList.toggle('body--no-scroll');
    })
})

// creating first 14 products
recalculateProductsPerView();

const data = await getProducts(currentPage);
renderProducts(data.data);

// creating banner
createProductsBanner()

// swiper
// 2 hours
let settings = {
    slidesPerView: 4,
    slidesPerGroup: 4,
    spaceBetween: 24,
}

if (isMobile) {
    settings = {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 16,
    }
}
const swiper = new Swiper('.swiper', {
    slidesPerView: settings.slidesPerView,
    slidesPerGroup: settings.slidesPerGroup,
    spaceBetween: settings.spaceBetween,
    allowTouchMove: false,
    scrollbar: {
        el: '.swiper-scrollbar',
        draggable: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
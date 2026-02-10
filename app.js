// --- CONFIGURAÇÃO ---
const CONFIG = {
    // Número do WhatsApp para onde o pedido será enviado
    phone: '5585999999999', 
    // Código do cupom para desconto
    couponCode: 'BOCAROXA10',
    // Porcentagem de desconto (0.1 = 10%)
    discountRate: 0.10
};

// --- DADOS DOS PRODUTOS ---
const products = [
    { id: 1, name: 'Copo 300ml', price: 12.00, emoji: '🥤' },
    { id: 2, name: 'Copo 500ml', price: 16.00, emoji: '🥡' },
    { id: 3, name: 'Copo 700ml', price: 20.00, emoji: '🧉' },
    { id: 4, name: 'Barca 1 Litro', price: 35.00, emoji: '⛵' }
];

const addonsList = [
    'Leite em pó', 'Leite Condensado', 'Paçoca', 'Granola', 
    'Morango', 'Banana', 'Kiwi', 'Chocolate'
];

// --- ESTADO DA APLICAÇÃO ---
let cart = [];
let appliedCoupon = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    updateFixedWhatsApp();
});

// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Renderiza a lista de produtos na tela principal
function renderProducts() {
    const productList = document.getElementById('product-list');
    
    products.forEach(product => {
        // Cria o HTML dos adicionais para cada produto
        let addonsHTML = addonsList.map((addon, index) => `
            <label class="addon-item">
                <input type="checkbox" name="addon-${product.id}" value="${addon}">
                ${addon}
            </label>
        `).join('');

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                
                <div class="addons-section">
                    <span class="addons-title">Escolha os adicionais:</span>
                    <div class="addons-list">
                        ${addonsHTML}
                    </div>
                </div>

                <button class="add-btn" onclick="addToCart(${product.id})">Adicionar</button>
            </div>
        `;
        productList.appendChild(productCard);
    });
}

// Renderiza os itens dentro do Carrinho
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Atualiza contador do ícone
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    // Limpa container visual
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-msg">Seu carrinho está vazio 😢</p>';
        cartTotal.innerText = 'R$ 0,00';
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>+ ${item.addons.length > 0 ? item.addons.join(', ') : 'Sem adicionais'}</p>
                <p><strong>R$ ${itemTotal.toFixed(2).replace('.', ',')}</strong></p>
            </div>
            <div class="cart-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">Remover</button>
            </div>
        `;
        cartContainer.appendChild(div);
    });

    // Cálculo do total com desconto
    let finalTotal = subtotal;
    if (appliedCoupon) {
        finalTotal = subtotal * (1 - CONFIG.discountRate);
        document.getElementById('coupon-message').innerText = `Cupom aplicado! (-${(CONFIG.discountRate * 100)}%)`;
        document.getElementById('coupon-message').className = 'coupon-success';
    } else {
        document.getElementById('coupon-message').innerText = '';
    }

    cartTotal.innerText = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
    saveCart();
}

// --- LÓGICA DO CARRINHO ---

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    // Coleta os adicionais marcados ESPECIFICAMENTE neste card de produto
    const checkboxes = document.querySelectorAll(`input[name="addon-${productId}"]:checked`);
    const selectedAddons = Array.from(checkboxes).map(cb => cb.value);

    // Cria um item único. Nota: Se mudar os adicionais, cria novo item na lista
    // Para simplificar, sempre adiciona um novo item ao array, a menos que seja identico
    // Mas para manter simples para iniciantes, vamos adicionar como novo objeto
    const cartItem = {
        id: Date.now(), // ID único para o item no carrinho
        name: product.name,
        price: product.price,
        addons: selectedAddons,
        quantity: 1
    };

    cart.push(cartItem);
    
    // Feedback visual simples
    alert(`${product.name} adicionado ao carrinho!`);
    
    // Limpa checkboxes
    checkboxes.forEach(cb => cb.checked = false);
    
    renderCart();
}

function updateQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        // Se a quantidade for para 0, pergunta se quer remover
        const confirmRemove = confirm("Remover este item?");
        if(confirmRemove) cart.splice(index, 1);
    }
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

// --- CUPOM E ENTREGA ---

function applyCoupon() {
    const input = document.getElementById('coupon-code');
    const msg = document.getElementById('coupon-message');
    
    if (input.value.toUpperCase() === CONFIG.couponCode) {
        appliedCoupon = CONFIG.couponCode;
        msg.innerText = "Cupom aplicado com sucesso!";
        msg.className = "coupon-success";
        renderCart(); // Recalcula total
    } else {
        appliedCoupon = null;
        msg.innerText = "Cupom inválido.";
        msg.className = "coupon-error";
        renderCart();
    }
}

function toggleDeliveryFields() {
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    const addressSection = document.getElementById('address-section');
    const addressInput = document.getElementById('address');

    if (deliveryType === 'retirada') {
        addressSection.style.display = 'none';
        addressInput.value = ''; // Limpa para não enviar lixo
    } else {
        addressSection.style.display = 'block';
    }
}

// --- LOCAL STORAGE ---

function saveCart() {
    localStorage.setItem('bocaRoxaCart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('bocaRoxaCart');
    if (saved) {
        cart = JSON.parse(saved);
        renderCart();
    }
}

// --- UI HELPERS ---

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    // Adiciona ou remove a classe 'active'
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
        modal.classList.remove('active');
    } else {
        modal.style.display = 'flex';
        modal.classList.add('active');
        renderCart();
    }
}

// Fecha modal ao clicar fora
document.getElementById('cart-modal').addEventListener('click', (e) => {
    if (e.target.id === 'cart-modal') toggleCart();
});

// Configura o botão fixo do WhatsApp apenas com o link base
function updateFixedWhatsApp() {
    const link = document.getElementById('fixed-whatsapp');
    link.href = `https://wa.me/${CONFIG.phone}`;
}

// --- FINALIZAÇÃO (CHECKOUT) ---

function checkout() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const name = document.getElementById('customer-name').value;
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('order-notes').value;

    // Validação simples
    if (!name) {
        alert("Por favor, digite seu nome.");
        return;
    }
    if (deliveryType === 'entrega' && !address) {
        alert("Por favor, digite o endereço de entrega.");
        return;
    }

    // Construção da Mensagem
    let message = `*NOVO PEDIDO - BOCA ROXA AÇAÍ* 💜\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Tipo:* ${deliveryType.toUpperCase()}\n`;
    
    if (deliveryType === 'entrega') {
        message += `*Endereço:* ${address}\n`;
    }
    
    message += `\n*ITENS DO PEDIDO:*\n`;
    
    let subtotal = 0;
    cart.forEach(item => {
        const totalItem = item.price * item.quantity;
        subtotal += totalItem;
        message += `▪️ ${item.quantity}x ${item.name}\n`;
        if (item.addons.length > 0) {
            message += `   _Adic: ${item.addons.join(', ')}_\n`;
        }
        message += `\n`;
    });

    let finalTotal = subtotal;
    if (appliedCoupon) {
        finalTotal = subtotal * (1 - CONFIG.discountRate);
        message += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        message += `*Cupom:* ${appliedCoupon} (-10%)\n`;
    }
    
    message += `*TOTAL A PAGAR: R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n`;

    if (notes) {
        message += `\n*Observações:* ${notes}\n`;
    }

    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.phone}?text=${encodedMessage}`;

    // Redireciona
    window.open(whatsappUrl, '_blank');
    
    // Opcional: Limpar carrinho após enviar
    // cart = [];
    // saveCart();
    // renderCart();
    // toggleCart();
}
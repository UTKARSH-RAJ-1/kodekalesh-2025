export function getFutureDate(daysToAdd) {
    const today = new Date();
    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
}

export function daysUntil(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function setActiveSidebarLink(activeId) {
    const links = document.querySelectorAll('#sidebar li a');
    links.forEach((link) => link.classList.remove('active'));
    document.getElementById(activeId)?.classList.add('active');
}

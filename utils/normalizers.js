function normalizeEmail(email) {
        if (typeof email !== "string") return null;
        const trimmed = email.trim();
        return trimmed === "" ? null : trimmed.toLowerCase();
}

function normalizeContactNumber(number) {

    if (typeof number !== string) return null;
    const trimmed = number.trim();

        if (trimmed.startsWith('09')) {
            return  trimmed.replace(/^09/, '+639');
        }
}

function normalizeName(name) {

    if (typeof name !== "string") return null;

    const trimmed = name.trim();
    

    return name
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

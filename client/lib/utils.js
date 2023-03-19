export async function copyToClipboard (content) {
    const permission = await navigator.permissions.query({name: "clipboard-write"});
    if (permission.state == 'granted') {
        await navigator.clipboard.writeText(content);
    }
}
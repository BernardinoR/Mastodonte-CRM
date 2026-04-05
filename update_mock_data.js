const fs = require('fs');

let content = fs.readFileSync('client/src/app/pages/mockups/MockupRealocador.tsx', 'utf-8');

// 1. In CATEGORIES, replace institution: "..." with account: "..."
content = content.replace(/institution:\s*"(XP|BTG|Itaú|Safra|Bradesco)"/g, (match, p1) => {
    const map = {
        "XP": "XP PF",
        "BTG": "BTG Principal",
        "Itaú": "Itaú Joint",
        "Safra": "Safra",
        "Bradesco": "Bradesco"
    };
    return `account: "${map[p1]}"`;
});

// 2. In byAccount: { ... }, replace keys
content = content.replace(/byAccount:\s*\{([^}]+)\}/g, (match, inner) => {
    let replaced = inner
        .replace(/XP:/g, '"XP PF":')
        .replace(/BTG:/g, '"BTG Principal":')
        .replace(/Itaú:/g, '"Itaú Joint":')
        .replace(/Safra:/g, '"Safra":')
        .replace(/Bradesco:/g, '"Bradesco":');
    return `byAccount: {${replaced}}`;
});

// 3. For the first SubCategory "CDI - Liquidez", let's split XP PF into XP PF and XP PJ to show the feature
// The original byAccount was: "XP PF": 470_000
// We change it to "XP PF": 300_000, "XP PJ": 170_000
content = content.replace(/"XP PF":\s*470_000/, '"XP PF": 300_000,\n          "XP PJ": 170_000');

// And we split the asset "a1"
const a1_asset = `id: "a1",
            name: "CDB Liquidez Diária XP",
            account: "XP PF",
            value: 470_000,
            pctSub: 29.9,`;

const a1_replaced = `id: "a1",
            name: "CDB Liquidez Diária XP",
            account: "XP PF",
            value: 300_000,
            pctSub: 19.1,
          },
          {
            id: "a1_pj",
            name: "CDB Caixa XP PJ",
            account: "XP PJ",
            value: 170_000,
            pctSub: 10.8,`;
content = content.replace(a1_asset, a1_replaced);

// Update ALL_CLIENT_ACCOUNTS definition if it's not already correct
// Make sure FGCInfo still uses institution
// Ensure NewAssetDraft still uses account instead of institution
content = content.replace(/interface NewAssetDraft \{([^}]+)\}/, (match, inner) => {
    return `interface NewAssetDraft {${inner.replace('institution: string;', 'account: string;')}}`;
});

content = content.replace(/account:\s*newAssetDraft\.institution/, 'account: newAssetDraft.account');
content = content.replace(/institution:\s*newAssetDraft\.institution/, 'account: newAssetDraft.account');
content = content.replace(/institution:\s*allAccounts\[0\]\?\.name/, 'account: allAccounts[0]?.name');
content = content.replace(/asset\.institution/g, 'asset.account');

fs.writeFileSync('client/src/app/pages/mockups/MockupRealocador.tsx', content);

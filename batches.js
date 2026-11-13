// batches.js - single source of truth for batch records and the current batch of each product.
// Used by verify.html (batch lookup) and coa-block.js (the Batch Verification block on every product page).
// When a new batch is tested: add its record below, then point currentBatch at it. Nothing else needs editing.

const batches = {
'NHS-BPC10-20260914-01': {
    alias: 'VBI-BPC10-20260914-01'
},
'NHS-GLT30-20260902-01': {
    alias: 'VBI-GLT30-20260902-01'
},
'NHS-TB510-20260921-01': {
    name: 'TB-500 10mg',
    content: '9.54',
    contentUnit: 'mg/vial',
    purity: '99',
    endotoxin: 'Pass',
    endotoxinUnit: '',
    endotoxinSpec: 'Microbials + Heavy Metals + Solvents',
    contentSpec: 'Label: 10 mg',
    puritySpec: '≥ 99% spec',
    tested: 'October 14, 2026',
    tests: [
        {
            title: 'Purity, Content, Microbials, Heavy Metals &amp; Solvents',
            taskId: '260930-786-NHS-9',
            date: '14 Oct 2026',
            status: 'Pass',
            rows: [
                { key: 'Content', value: '9.54', unit: 'mg/vial', large: true },
                { key: 'Purity', value: '99', unit: '%', large: true },
                { key: 'Water Activity', value: '0.23 aw' },
                { key: 'Microbials', value: 'Pass (E. coli, Salmonella, Aspergillus spp. not detected)' },
                { key: 'Heavy Metals', value: 'Pass (As, Cd, Pb, Hg not detected; API lot)' },
                { key: 'Residual Solvents', value: 'Pass (21 analytes; API lot)' },
                { key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
            ],
            verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTMwLTc4Ni1OSFMtOSIsInAiOiJWYW50aXggQmlvIiwibCI6Ik5IUy1UQjUxMC0yMDI2MDkyMS0wMSJ9.yjB_9_BmwyhZWCvBCFRXz2ImVnXLhkoM',
            verifyKey: '260930-786-NHS-9',
            downloadUrl: '/coa/NHS-TB510-20260921-01.pdf',
            imageUrl: '/coa/NHS-TB510-20260921-01-full.jpg'
        }
    ]
},
'NHS-TSM10-20260921-01': {
    name: 'Tesamorelin 10mg',
    content: '10.28',
    contentUnit: 'mg/vial',
    purity: '99',
    endotoxin: 'Pass',
    endotoxinUnit: '',
    endotoxinSpec: 'Microbials + Heavy Metals + Solvents',
    contentSpec: 'Label: 10 mg',
    puritySpec: '≥ 99% spec',
    tested: 'October 14, 2026',
    tests: [
        {
            title: 'Purity, Content, Microbials, Heavy Metals &amp; Solvents',
            taskId: '260930-786-NHS-8',
            date: '14 Oct 2026',
            status: 'Pass',
            rows: [
                { key: 'Content', value: '10.28', unit: 'mg/vial', large: true },
                { key: 'Purity', value: '99', unit: '%', large: true },
                { key: 'Water Activity', value: '0.26 aw' },
                { key: 'Microbials', value: 'Pass (E. coli, Salmonella, Aspergillus spp. not detected)' },
                { key: 'Heavy Metals', value: 'Pass (As, Cd, Pb, Hg not detected; API lot)' },
                { key: 'Residual Solvents', value: 'Pass (API lot)' },
                { key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
            ],
            verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTMwLTc4Ni1OSFMtOCIsInAiOiJWYW50aXggQmlvIiwibCI6Ik5IUy1UU00xMC0yMDI2MDkyMS0wMSJ9.6ykYjQpTvXvs_9zoqP0JeKUOPkAuXBG8',
            verifyKey: '260930-786-NHS-8',
            downloadUrl: '/coa/NHS-TSM10-20260921-01.pdf',
            imageUrl: '/coa/NHS-TSM10-20260921-01-full.jpg'
        }
    ]
},
'NHS-GLR20-20260827-01': {
    name: 'VX-3R 20mg',
    content: '19.8786',
    contentUnit: 'mg/vial',
    purity: '99',
    endotoxin: 'Pass',
    endotoxinUnit: '',
    endotoxinSpec: 'Microbials + Heavy Metals + Solvents',
    contentSpec: 'Label: 20 mg',
    puritySpec: '≥ 99% spec',
    tested: 'September 28, 2026',
    tests: [
        {
            title: 'Purity, Content, Microbials, Heavy Metals &amp; Solvents',
            taskId: '260901-899-NHS-5',
            date: '28 Sep 2026',
            status: 'Pass',
            rows: [
                { key: 'Content', value: '19.8786', unit: 'mg/vial', large: true },
                { key: 'Purity', value: '99', unit: '%', large: true },
                { key: 'Water Activity', value: '0.1174 aw' },
                { key: 'Microbials', value: 'Pass (E. coli, Salmonella, Aspergillus spp. not detected)' },
                { key: 'Heavy Metals', value: 'Pass' },
                { key: 'Residual Solvents', value: 'Pass' },
                { key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
            ],
            verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTAxLTg5OS1OSFMtNSIsInAiOiJWYW50aXggQmlvIiwibCI6IlZCSS1HTFIyMC0yMDI2MDgyNy0wMSJ9.ZcMcs9L6qQXD9zC7QZPfOMdNtBVibDkH',
            verifyKey: '260901-899-NHS-5',
            downloadUrl: '/coa/NHS-GLR20-20260827-01.pdf',
            imageUrl: '/coa/NHS-GLR20-20260827-01-full.jpg'
        }
    ]
},
'VBI-GLR20-20260827-01': {
    alias: 'NHS-GLR20-20260827-01'
},
'VBI-GLT30-20260902-01': {
    name: 'VX-2T 30mg',
    content: '32.89',
    contentUnit: 'mg/vial',
    purity: '99',
    endotoxin: 'Pass',
    endotoxinUnit: '',
    endotoxinSpec: 'Microbials + Heavy Metals + Solvents',
    contentSpec: 'Label: 30 mg',
    puritySpec: '≥ 99% spec',
    tested: 'October 8, 2026',
    tests: [
        {
            title: 'Purity, Content, Microbials, Heavy Metals &amp; Solvents',
            taskId: '260908-899-NHS-8',
            date: '8 Oct 2026',
            status: 'Pass',
            rows: [
                { key: 'Content', value: '32.89', unit: 'mg/vial', large: true },
                { key: 'Purity', value: '99', unit: '%', large: true },
                { key: 'Net Peptide Content', value: '29.82% w/w (298.2 mg/g)' },
                { key: 'Water Activity', value: '0.11 aw' },
                { key: 'Microbials', value: 'Pass (E. coli, Salmonella, Aspergillus spp. not detected)' },
                { key: 'Heavy Metals', value: 'Pass (As, Cd, Pb, Hg not detected; API lot)' },
                { key: 'Residual Solvents', value: 'Pass (21 analytes; API lot)' },
                { key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
            ],
            verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTA4LTg5OS1OSFMtOCIsInAiOiJWYW50aXggQmlvIiwibCI6IlZCSS1HTFQzMC0yMDI2MDkwMi0wMSJ9.ANRjjpgYF6sBo8aRl6La9m59IH2SFeJP',
            verifyKey: '260908-899-NHS-8',
            downloadUrl: '/coa/NHS-GLT30-20260902-01.pdf',
            imageUrl: '/coa/NHS-GLT30-20260902-01-full.jpg'
        }
    ]
},
'VBI-BPC10-20260914-01': {
    name: 'BPC-157 10mg',
    content: '9.9966',
    contentUnit: 'mg/vial',
    purity: '99',
    endotoxin: 'Pass',
    endotoxinUnit: '',
    endotoxinSpec: 'Microbials + Heavy Metals + Solvents',
    contentSpec: '≥ 10 mg spec',
    puritySpec: '≥ 99% spec',
    tested: 'September 29, 2026',
    tests: [
        {
            title: 'Complete Analysis (10 Panels)',
            taskId: '260922-NHS-1',
            date: '29 Sep 2026',
            status: 'Pass',
            rows: [
                { key: 'Content', value: '9.9966', unit: 'mg/vial', large: true },
                { key: 'Purity', value: '99', unit: '%', large: true },
                { key: 'Recovery', value: '99.966', unit: '% nominal' },
                { key: 'Identity', value: 'Match (MW 1419.5 g/mol)' },
                { key: 'Water Activity', value: '0.292 aw' },
                { key: 'Water Content (KF)', value: '0.8655%' },
                { key: 'pH', value: '7.0' },
                { key: 'Microbials', value: 'Pass (10 tests)' },
                { key: 'Heavy Metals', value: 'Pass (As, Cd, Pb, Hg)' },
                { key: 'Residual Solvents', value: 'Pass (12 tests)' },
                { key: 'Sterility', value: 'Pass' },
                { key: 'Mycotoxins', value: 'Pass' },
                { key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
            ],
            verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTIyLU5IUy0xIiwicCI6IlZhbnRpeCBCaW8iLCJsIjoiVkJJLUJQQzEwLTIwMjYwOTE0LTAxIn0.FFd_NpsvKiyW3LgMLmtIYj3WSj_wzzbe',
            verifyKey: '260922-NHS-1',
            downloadUrl: '/coa/NHS-BPC10-20260914-01.pdf',
            imageUrl: '/coa/NHS-BPC10-20260914-01-full.jpg'
        }
    ]
},
'VX-MOTS10-001': {
name: 'MOTS-c 10mg',
content: '10.55',
contentUnit: 'mg/vial',
purity: '99.402',
endotoxin: '<1',
endotoxinUnit: 'EU/vial',
endotoxinSpec: '≤ 1 EU/mg spec',
contentSpec: '≥ 10 mg spec',
puritySpec: '≥ 99% spec',
tested: 'May 29, 2026',
tests: [
{
title: 'Purity & Identity',
taskId: '165874',
date: '29 May 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '10.55', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '99.402', unit: '%', large: true },
{ key: 'Method', value: 'HPLC' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165874-MOTS_c_10mg_SSELJFCHMJCC',
verifyKey: 'SSELJFCHMJCC',
downloadUrl: '/coa/VX-MOTS10-001-purity.jpg',
imageUrl: '/img/vx-mots10-001-purity.jpg'
},
{
title: 'Endotoxin',
taskId: '165875',
date: '28 May 2026',
status: 'Pass',
rows: [
{ key: 'Endotoxin', value: '<1', unit: 'EU/vial', large: true },
{ key: 'Specification', value: '≤ 1 EU/mg' },
{ key: 'Method', value: 'LAL Assay' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165875-MOTS_c_10mg_E8SZBFXHVEZV',
verifyKey: 'E8SZBFXHVEZV',
downloadUrl: '/coa/VX-MOTS10-001-endotoxin.jpg',
imageUrl: '/img/vx-mots10-001-endotoxin.jpg'
}
]
},
'VX-MOTS10-002': {
name: 'MOTS-c 10mg',
content: '11.56',
contentUnit: 'mg/vial',
purity: '98.939',
endotoxin: '<1',
endotoxinUnit: 'EU/vial',
endotoxinSpec: '≤ 1 EU/mg spec',
contentSpec: 'Label claim 10 mg',
puritySpec: 'Below our standard 99% spec',
tested: 'October 15, 2026',
tests: [
{
title: 'Purity & Content',
taskId: '241199',
date: '15 Oct 2026',
status: 'Reported',
rows: [
{ key: 'Content', value: '11.56', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '98.939', unit: '%', large: true }
],
verifyUrl: 'https://verify.janoshik.com/tests/241199-MOTSc_10mg_LVTNBGY1L5FU',
verifyKey: 'LVTNBGY1L5FU',
downloadUrl: '/coa/VX-MOTS10-002-purity.png',
imageUrl: '/img/vx-mots10-002-purity.png'
},
{
title: 'Endotoxin',
taskId: '241200',
date: '14 Oct 2026',
status: 'Reported',
rows: [
{ key: 'Endotoxin', value: '<1', unit: 'EU/vial', large: true }
],
verifyUrl: 'https://verify.janoshik.com/tests/241200-MOTSc_10mg_KAREF1E5L8R6',
verifyKey: 'KAREF1E5L8R6',
downloadUrl: '/coa/VX-MOTS10-002-endotoxin.png',
imageUrl: '/img/vx-mots10-002-endotoxin.png'
}
]
},
'VX-TIRZ30-001': {
name: 'Tirzepatide 30mg',
content: '32.35',
contentUnit: 'mg/vial',
purity: '99.891',
endotoxin: '<1',
endotoxinUnit: 'EU/vial',
endotoxinSpec: '≤ 1 EU/mg spec',
contentSpec: '≥ 30 mg spec',
puritySpec: '≥ 99% spec',
tested: 'June 1, 2026',
tests: [
{
title: 'Purity & Identity',
taskId: '165870',
date: '01 Jun 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '32.35', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '99.891', unit: '%', large: true },
{ key: 'Method', value: 'HPLC' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165870-Tirzepatide_30mg_P13VV4QMNVV7',
verifyKey: 'P13VV4QMNVV7',
downloadUrl: '/coa/VX-TIRZ30-001-purity.jpg',
imageUrl: '/coa/VX-TIRZ30-001-purity.jpg'
},
{
title: 'Endotoxin',
taskId: '165871',
date: '28 May 2026',
status: 'Pass',
rows: [
{ key: 'Endotoxin', value: '<1', unit: 'EU/vial', large: true },
{ key: 'Specification', value: '≤ 1 EU/mg' },
{ key: 'Method', value: 'LAL Assay' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165871-Tirzepatide_30mg_4GXKXMF72FV9',
verifyKey: '4GXKXMF72FV9',
downloadUrl: '/coa/VX-TIRZ30-001-endotoxin.jpg',
imageUrl: '/coa/VX-TIRZ30-001-endotoxin.jpg'
}
]
},
'VX-RETA20-002': {
name: 'Retatrutide 20mg',
content: '21.95',
contentUnit: 'mg/vial',
purity: '99.440',
endotoxin: '<1',
endotoxinUnit: 'EU/vial',
endotoxinSpec: '≤ 1 EU/mg spec',
contentSpec: '≥ 20 mg spec',
puritySpec: '≥ 99% spec',
tested: 'June 1, 2026',
tests: [
{
title: 'Purity & Identity',
taskId: '165868',
date: '01 Jun 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '21.95', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '99.440', unit: '%', large: true },
{ key: 'Method', value: 'HPLC' }
],
verifyUrl: 'https://janoshik.com/tests/165868-Retatrutide_20mg_JQQ8BZLM8YKS',
verifyKey: 'JQQ8BZLM8YKS',
downloadUrl: '/coa/VX-RETA20-002-purity.png',
imageUrl: '/coa/VX-RETA20-002-purity.png'
},
{
title: 'Endotoxin',
taskId: '165869',
date: '28 May 2026',
status: 'Pass',
rows: [
{ key: 'Endotoxin', value: '<1', unit: 'EU/vial', large: true },
{ key: 'Specification', value: '≤ 1 EU/mg' },
{ key: 'Method', value: 'LAL Assay' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165869-Retatrutide_20mg_R4CWKQHP3ED3',
verifyKey: 'R4CWKQHP3ED3',
downloadUrl: '/coa/VX-RETA20-002-endotoxin.jpg',
imageUrl: '/coa/VX-RETA20-002-endotoxin.jpg'
}
]
},
'NHS-GLR20-20260823-01': {
name: 'VX-3R 20mg',
content: '19.7452',
contentUnit: 'mg/vial',
purity: '99',
endotoxin: 'Pass',
endotoxinUnit: '',
endotoxinSpec: '',
contentSpec: '≥ 20 mg spec',
puritySpec: '≥ 99% spec',
tested: 'September 1, 2026',
tests: [
{
title: 'Complete Analysis (10 Panels)',
taskId: '260901-899-NHS-9',
date: '01 Sep 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '19.7452', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '99', unit: '%', large: true },
{ key: 'Recovery', value: '98.726', unit: '% nominal' },
{ key: 'Identity', value: 'Match (MW 2619.1 g/mol)' },
{ key: 'Water Activity', value: '0.2051 aw' },
{ key: 'Water Content (KF)', value: '0.779%' },
{ key: 'pH', value: '7.0' },
{ key: 'Microbials', value: 'Pass (10 tests)' },
{ key: 'Heavy Metals', value: 'Pass (0.000 ppm all)' },
{ key: 'Residual Solvents', value: 'Pass (0.000 ppm all 12)' },
{ key: 'Sterility', value: 'Pass' },
{ key: 'Mycotoxins', value: 'Pass' },
{ key: 'Lab', value: 'PH Solutions Lab (ISO/IEC 17025:2017)' }
],
verifyUrl: 'https://www.phsolutionslab.com/c/eyJjIjoiMjYwOTAxLTg5OS1OSFMtOSIsInAiOiJWYW50aXggQmlvIiwibCI6IlZCSS1HTFIyMC0yMDI2MDgyMy0wMSJ9.ioiEV19MRJUvNH5NP4W4VDQPg0eXDQ5L',
verifyKey: '260901-899-NHS-9',
downloadUrl: '/coa/VBI-GLR20-20260823-01.jpg',
imageUrl: '/coa/VBI-GLR20-20260823-01.jpg'
}
]
},
'VBI-GLR20-20260823-01': {
name: 'VX-3R 20mg',
alias: 'NHS-GLR20-20260823-01'
},
'VX-RETA20-003': {
name: 'Retatrutide 20mg',
content: '22.88',
contentUnit: 'mg/vial',
purity: '99.823',
endotoxin: 'Not tested',
endotoxinUnit: '',
endotoxinSpec: '',
contentSpec: '≥ 20 mg spec',
puritySpec: '≥ 99% spec',
tested: 'September 4, 2026',
tests: [
{
title: 'Purity & Identity',
taskId: '228666',
date: '04 Sep 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '22.88', unit: 'mg/vial', large: true },
{ key: 'Purity', value: '99.823', unit: '%', large: true },
{ key: 'Method', value: 'HPLC' }
],
verifyUrl: 'https://verify.janoshik.com/tests/228666-Retatrutide_20mg_AJRU2PQVJRR3',
verifyKey: 'AJRU2PQVJRR3',
downloadUrl: '/coa/VX-RETA20-003-purity.jpg',
imageUrl: '/coa/VX-RETA20-003-purity.jpg'
}
]
},
'VX-NAD1K-001': {
name: 'NAD+ 1000mg',
content: '1042.81',
contentUnit: 'mg/vial',
purity: 'N/A',
endotoxin: 'Not applicable',
endotoxinUnit: '',
contentSpec: '≥ 1000 mg spec',
puritySpec: 'Nucleotide (quant only)',
tested: 'May 28, 2026',
tests: [
{
title: 'NAD+ Content Analysis',
taskId: '165876',
date: '28 May 2026',
status: 'Pass',
rows: [
{ key: 'Content', value: '1042.81', unit: 'mg/vial', large: true },
{ key: 'Specification', value: '≥ 1000 mg' },
{ key: 'Method', value: 'Quantitative Analysis' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165876-NAD_1000mg_B9A5W5KYHMGU',
verifyKey: 'B9A5W5KYHMGU',
downloadUrl: '/coa/VX-NAD1k-001-purity.png',
imageUrl: '/coa/VX-NAD1k-001-purity.png'
}
]
},
'VX-SEMA10-001': { name: 'Semaglutide 10mg' },
'VX-BPC10-001': { name: 'BPC-157 10mg' },
'VX-TB10-001': { name: 'TB-500 10mg' },
'VX-CJC5-001': { name: 'CJC-1295 10mg' },
'VX-IPA5-001': { name: 'Ipamorelin 5mg' },
'VX-GHK100-001': {
name: 'GHK-Cu 100mg',
content: '108.58',
contentUnit: 'mg/vial',
purity: '99.958',
endotoxin: '1.421',
endotoxinUnit: 'EU/vial',
endotoxinSpec: '≤ 5 EU/vial spec',
tested: 'June 1, 2026',
contentSpec: '≥ 100 mg spec',
puritySpec: '≥ 99% spec',
tests: [
{
title: 'Purity & Content',
taskId: '165872',
date: '01 Jun 2026',
status: 'Pass',
rows: [
{ key: 'Content (Total)', value: '108.58', unit: 'mg/vial', large: true },
{ key: 'GHK Content', value: '91.18', unit: 'mg' },
{ key: 'Copper Content', value: '17.40', unit: 'mg' },
{ key: 'Purity', value: '99.958', unit: '%', large: true },
{ key: 'Method', value: 'HPLC' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165872-GHKCu_100mg_UW7KTUA5BDFS',
verifyKey: 'UW7KTUA5BDFS',
downloadUrl: '/coa/VX-GHK100-001-purity.jpg',
imageUrl: '/img/vx-ghk100-001-purity.jpg'
},
{
title: 'Endotoxin Analysis',
taskId: '165873',
date: '28 May 2026',
status: 'Pass',
rows: [
{ key: 'Endotoxin', value: '1.421', unit: 'EU/vial', large: true },
{ key: 'Method', value: 'LAL' }
],
verifyUrl: 'https://verify.janoshik.com/tests/165873-GHKCu_100mg_4KBW4KK2PT5E',
verifyKey: '4KBW4KK2PT5E',
downloadUrl: '/coa/VX-GHK100-001-endotoxin.jpg',
imageUrl: '/img/vx-ghk100-001-endotoxin.jpg'
}
]
},
'VX-TESA10-001': { name: 'Tesamorelin 10mg' }
};

// Which batch is currently on sale for each product page (key = product page slug).
// Pages show only what the record supports: no record results, no numbers.
const currentBatch = {
  "vx-3r": "NHS-GLR20-20260827-01",
  "vx-2t": "NHS-GLT30-20260902-01",
  "bpc-157": "NHS-BPC10-20260914-01",
  "tb-500": "NHS-TB510-20260921-01",
  "tesamorelin": "NHS-TSM10-20260921-01",
  "ghk-cu": "VX-GHK100-001",
  "mots-c": "VX-MOTS10-001",
  "mots-c-batch-2": "VX-MOTS10-002",
  "nad-1000mg": "VX-NAD1K-001",
  "cjc-1295": "VX-CJC5-001",
  "ipamorelin": "VX-IPA5-001"
};

// Follow alias entries to the real record (guarded against loops).
function resolveBatch(id) {
  let rec = batches[id];
  for (let i = 0; rec && rec.alias && i < 5; i++) rec = batches[rec.alias];
  return rec || null;
}

# How to Read an HPLC Chromatogram: Peak Analysis for Peptide Purity Verification

When you receive a Certificate of Analysis (COA) for a research peptide, the HPLC chromatogram is the visual proof of purity. But if you've never interpreted one, the graph can look cryptic — a series of peaks and squiggles that seem to require a chemistry degree to decode.

It doesn't. Once you understand what you're looking at, reading an HPLC chromatogram becomes straightforward. This guide breaks down the anatomy of an HPLC trace, explains what each element means, and shows you how to spot red flags that indicate contamination or poor-quality synthesis.

If you're evaluating research peptides for laboratory use, this is the skill that separates verification from blind trust.

---

## What Is HPLC and Why Does It Matter?

**High-Performance Liquid Chromatography (HPLC)** is the analytical gold standard for measuring peptide purity. It works by passing a dissolved sample through a column filled with material that interacts differently with various molecules. Pure peptides exit the column at a specific time (called **retention time**), while impurities — incomplete synthesis chains, aggregates, or contaminants — exit at different times.

The result is a **chromatogram**: a graph that plots time (x-axis) against absorbance (y-axis). Each peak represents a different molecule detected as it exits the column.

For peptide verification, HPLC answers one critical question: **What percentage of the sample is the target peptide, and what percentage is something else?**

---

## Anatomy of an HPLC Chromatogram

Here's what you're looking at when you open an HPLC trace on a Janoshik COA:

### **1. X-Axis: Retention Time (Minutes)**
The horizontal axis shows time elapsed since the sample was injected into the HPLC system. Most peptide analyses run 10-30 minutes depending on the method.

The **main peak** (target peptide) will appear at a consistent retention time for that specific compound and method. For example, if BPC-157 consistently elutes at 14.2 minutes under the test conditions, that's where you expect to see the dominant peak.

### **2. Y-Axis: Absorbance (mAU)**
The vertical axis measures absorbance — how much light the detector absorbed as each molecule passed through. Taller peaks mean higher concentrations of that molecule.

Most peptide HPLC tests use **214 nm wavelength**, which peptides absorb strongly due to their peptide bonds. This makes the method highly sensitive to even trace impurities.

### **3. The Main Peak**
This is the tall, sharp peak that represents your target peptide. In a high-purity sample (>99%), this peak dominates the chromatogram.

**What to look for:**
- **Symmetry**: The peak should be relatively symmetrical — a smooth rise and fall. Asymmetry can indicate degradation or column issues.
- **Sharpness**: A clean, narrow peak suggests good separation and high purity. Broad peaks can indicate aggregation or poor resolution.
- **Height**: The main peak should dwarf any other peaks present.

### **4. Area Under the Curve (AUC) = Purity %**
Purity isn't measured by peak height — it's measured by **area under the curve**. The HPLC software integrates the area of each peak, then calculates what percentage of the total area belongs to the main peak.

**Example:**
- Main peak area: 99.2% → **Purity: 99.2%**
- Small impurity peak area: 0.8%

This is the number reported as "Purity by HPLC" on the COA.

### **5. Impurity Peaks**
Any additional peaks are impurities. These can be:
- **Deletion sequences** (incomplete peptide chains from synthesis)
- **Aggregates** (peptides clumped together)
- **Starting materials or solvents** (reagents from the manufacturing process)
- **Degradation products** (breakdown from improper storage)

Small impurity peaks (<1% each) are normal even in high-purity samples. Large impurity peaks (>2-3%) indicate lower synthesis quality or contamination.

---

## Reading a Real Chromatogram: What to Check

When you review an HPLC chromatogram on a COA, follow this checklist:

### **1. Identify the Main Peak**
Look for the tallest, sharpest peak. This should be your target peptide. Cross-reference the retention time with the method details if provided.

### **2. Check for Baseline Stability**
The baseline (the flat line when no peaks are present) should be smooth and near zero. A drifting or noisy baseline can indicate instrument issues or sample contamination, which may affect accuracy.

### **3. Count the Impurity Peaks**
How many other peaks are visible? If you see more than 2-3 small peaks, the sample may have synthesis issues. Each additional peak represents a contaminant.

### **4. Assess Peak Symmetry**
- **Tailing** (long tail on the right side): Can indicate column degradation or interaction with impurities.
- **Fronting** (leading edge on the left): Often a sign of column overload or sample prep issues.
- **Splitting** (double peaks where one is expected): Suggests degradation, isomers, or incomplete synthesis.

### **5. Compare Purity % to Peak Visuals**
If the COA reports 99.5% purity, you should see one dominant peak that clearly accounts for nearly all the area. If multiple peaks look similar in size, something's wrong — either the purity calculation is incorrect or the wrong peak was integrated as the main compound.

---

## What Janoshik COAs Show

Janoshik Analytical is the most widely used third-party lab in the research peptide space. Their HPLC reports include:

1. **Chromatogram image** – The full HPLC trace
2. **Purity by HPLC (%)** – Calculated from peak area integration
3. **Retention time** – When the main peak eluted
4. **Method details** – Column type, mobile phase, detection wavelength

When reading a Janoshik COA, focus on the chromatogram first. If it shows a single dominant peak with minimal background noise and no significant impurity peaks, the reported purity is credible.

If you see multiple large peaks or irregular shapes, treat the purity number with skepticism — even if it says ">98%."

---

## Red Flags: When a Chromatogram Looks Wrong

**🚩 Multiple peaks of similar height**
This suggests the sample contains significant impurities or that the wrong peak was integrated as the main compound. High-purity peptides should have one dominant peak.

**🚩 Broad or split main peak**
Indicates degradation, poor synthesis, or that the peptide has isomers or aggregates. This reduces effective purity even if the reported number looks good.

**🚩 Baseline drift or noise**
A noisy baseline makes accurate integration difficult. If the baseline isn't stable, the purity calculation may be unreliable.

**🚩 Peak at the void volume (very early in the trace)**
A peak appearing in the first 1-2 minutes often represents unretained material — salts, solvents, or large aggregates that didn't interact with the column. This isn't counted in purity, but it suggests formulation issues.

**🚩 No chromatogram provided**
If a COA reports HPLC purity but doesn't include the actual chromatogram, you're taking the vendor's word. Real third-party labs (like Janoshik) always include the raw trace.

---

## Why 214nm Wavelength Matters

Most peptide HPLC methods use **UV detection at 214 nm**. This wavelength is absorbed by peptide bonds (specifically the carbonyl group in the backbone), making it universally sensitive to peptides regardless of sequence.

Some methods also scan at 280 nm, which detects aromatic amino acids (tryptophan, tyrosine). If your peptide contains these residues, a 280 nm trace can provide additional confirmation.

If a COA lists detection at a non-standard wavelength (say, 254 nm or 220 nm), it's not necessarily wrong — but 214 nm is the peptide-specific standard. Deviating from it without explanation can be a yellow flag.

---

## How HPLC Fits Into Full Verification

HPLC tells you **purity** — what percentage of your sample is the target peptide. But it doesn't tell you **identity** (whether that peak is actually the peptide you ordered).

For complete verification, you need:
- **HPLC** → Purity
- **LC-MS (mass spectrometry)** → Identity (confirms molecular weight)
- **LAL endotoxin test** → Safety (bacterial contamination)

Janoshik provides all three. A full COA includes the HPLC chromatogram, mass spec data, and endotoxin results. If you're only getting one or two of these tests, you're not getting full verification.

For more on what to look for in a complete COA, see our guide on [how to read a Janoshik Certificate of Analysis](#).

---

## Summary: The Checklist

When reviewing an HPLC chromatogram on a COA:

✅ **One dominant peak** – Sharp, symmetrical, and much taller than any other peaks  
✅ **Purity >99%** – Reported purity should match the visual dominance of the main peak  
✅ **Stable baseline** – Flat, minimal noise  
✅ **Few or no impurity peaks** – Small peaks (<1%) are normal; large ones are red flags  
✅ **Chromatogram included** – If it's not shown, the purity claim is unverifiable  

If the chromatogram looks clean and the purity number is high, you have credible evidence that your peptide is what it claims to be. If the trace shows multiple peaks, irregular shapes, or baseline issues, proceed with caution — even if the reported purity looks acceptable.

HPLC isn't perfect. But it's the best tool we have for verifying peptide purity in a research context. Learn to read it, and you'll never rely on a vendor's word alone.

---

**Related Articles:**
- [How to Read a Janoshik Certificate of Analysis](#)
- [Why Batch-Level COAs Matter](#)
- [Understanding Mass Spectrometry for Peptide Identity](#)

---

*Vantix Bio provides batch-specific Janoshik verification for every research peptide we distribute. Every batch includes HPLC purity analysis, LC-MS identity confirmation, and LAL endotoxin testing. [View our verification portal](#) or [browse verified peptides](#).*

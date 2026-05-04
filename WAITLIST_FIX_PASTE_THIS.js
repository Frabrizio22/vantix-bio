// ============================================
// PASTE THIS INTO index.html
// Replace the waitlistForm.onsubmit line (around line 673)
// ============================================

waitlistForm.onsubmit=async(e)=>{
  e.preventDefault();
  const email=document.getElementById('waitlistEmail').value;
  const btn=waitlistForm.querySelector('button');
  btn.disabled=true;
  btn.textContent='Submitting...';
  
  try{
    const res=await fetch('https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec',{
      method:'POST',
      body:JSON.stringify({
        action:'notify',
        email:email,
        product:'General Launch'
      })
    });
    
    if(res.ok){
      waitlistFormContainer.style.display='none';
      waitlistSuccess.classList.add('active');
    }else{
      alert('Error submitting. Please try again.');
      btn.disabled=false;
      btn.textContent='Notify me at launch';
    }
  }catch(err){
    alert('Error submitting. Please try again.');
    btn.disabled=false;
    btn.textContent='Notify me at launch';
  }
}

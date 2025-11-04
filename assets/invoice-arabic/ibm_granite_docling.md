<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: 20px auto; line-height: 1.4; }
    .header { margin-bottom: 1rem; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .title { font-weight: bold; }
    .totals { margin-top: 1rem; border-top: 1px solid #000; padding-top: 0.5rem; }
    .center { text-align: center; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <div>Calicut, 593, Kerala.</div>
  </div>

  <div class="row">
    <div class="title">VAT Reg. No :</div>
    <div>123456</div>
  </div>
  <div class="row">
    <div class="title">Invoice No :</div>
    <div>________</div>
  </div>
  <div class="row">
    <div class="title">Date :</div>
    <div>________</div>
  </div>
  <div class="row">
    <div class="title">Sales Person :</div>
    <div>________</div>
  </div>

  <h3 style="margin-top:1rem;">AMOUNT</h3>
  <div class="row">
    <div>Item 1</div>
    <div>9.60 SR</div>
  </div>
  <div class="row">
    <div>Item 2</div>
    <div>1.28 SR</div>
  </div>
  <div class="row">
    <div>Item 3</div>
    <div>2.70 SR</div>
  </div>

  <div class="totals">
    <div class="row">
      <div class="title">TOTAL</div>
      <div>________ SR</div>
    </div>
    <div class="row">
      <div class="title">VAT 5%</div>
      <div>________ SR</div>
    </div>
    <div class="row">
      <div class="title">NET AMOUNT</div>
      <div>________ SR</div>
    </div>
    <div class="row">
      <div class="title">Cash (SAR)</div>
      <div>________ SR</div>
    </div>
    <div class="row">
      <div class="title">RECEIVED</div>
      <div>________ SR</div>
    </div>
    <div class="row">
      <div class="title">Change</div>
      <div>________ SR</div>
    </div>
  </div>

  <div class="center">
    Thank
  </div>
</body>
</html>

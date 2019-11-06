export const routeMapTemplate = `
<!doctype html>

<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Route Map</title>
  <style>
  body {
    margin: 0;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
    background-color: #fff;
  }

  p{
    margin: 0;
  }

  table{
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    display: table;
    border-spacing: 2px;
    border-color: grey;
  }

  th{
    padding: .75rem;
    vertical-align: center;
    display: table-cell;
  }

  tr{
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;
  }

  td{
    padding: .75rem;
    vertical-align: center;
    border-top: 1px solid #dee2e6;
    display: table-cell;
  }
  </style>
</head>

<body>
  {{routeMap}}
</body>

</html>`;

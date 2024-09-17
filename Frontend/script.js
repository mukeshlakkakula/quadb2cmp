async function fetchCryptoData() {
    try {
      const response = await fetch('http://localhost:4000/api/getTop10');
      const data = await response.json();
      console.log(data)

      const tableBody = document.getElementById('crypto-table');
      tableBody.innerHTML = ''; // Clear the table before populating it
  
      data.forEach((crypto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>  <!-- Serial number -->
          <td>${crypto.name}</td>
          <td>₹ ${crypto.last}</td>
          <td>₹ ${crypto.buy}</td>
          <td>₹ ${crypto.sell}</td>
          <td>${crypto.volume}</td>
          <td>${crypto.base_unit}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }
  
  // Fetch the data initially and refresh every 10 seconds
  fetchCryptoData();
  setInterval(fetchCryptoData, 10000);
  
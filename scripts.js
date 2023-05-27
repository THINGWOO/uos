let myChart = null;

function getColorByEducationOffice(officeName) {
  switch (officeName) {
    case "서울특별시동부교육지원청":
      return "#e6194b";
    case "서울특별시서부교육지원청":
      return "#3cb44b";
    case "서울특별시남부교육지원청":
      return "#ffe119";
    case "서울특별시북부교육지원청":
      return "#4363d8";
    case "서울특별시강동송파교육지원청":
      return "#f58231";
    case "서울특별시강서양천교육지원청":
      return "#911eb4";
    case "서울특별시강남서초교육지원청":
      return "#46f0f0";
    case "서울특별시동작관악교육지원청":
      return "#f032e6";
    case "서울특별시성동광진교육지원청":
      return "#fabebe";
    case "서울특별시성북강북교육지원청":
      return "#008080";

  }
}

function aggregateStudentCounts(selectedSchools) {
  const aggregatedCounts = {};
  const schoolNames = [];

  selectedSchools.forEach((school) => {
    schoolNames.push(school.학교명);
    console.log("School:", school.학교명);
    for (let year = 2008; year <= 2022; year++) {
      const studentCount = school[`${year}년 학생수`] ? Number(school[`${year}년 학생수`]) : 0; // 숫자로 변환
      console.log(`${year}년 학생수:`, studentCount);
      if (!aggregatedCounts[year]) {
        aggregatedCounts[year] = 0;
      }
      aggregatedCounts[year] += studentCount; // 숫자로 변환된 학생수를 더함
    }
  });

  console.log("Aggregated Counts:", aggregatedCounts);
  return { aggregatedCounts, schoolNames };
}

function drawChart(aggregatedCounts, schoolNames) {
  const ctx = document.getElementById("chart").getContext("2d");

  // 이전 차트가 존재하는 경우 삭제
  if (myChart) {
    myChart.destroy();
  }

  const chartData = {
    labels: Object.keys(aggregatedCounts),
    datasets: [
      {
        label: "학생수",
        data: Object.values(aggregatedCounts),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: `학생수 추이: ${schoolNames.join(', ')}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  myChart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: chartOptions,
  });
}

function createSchoolIcon(selected = false) {
  const iconUrl = selected ? "school_selected.png" : "school.png";
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([37.5665, 126.9780], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const schoolIcon = L.icon({
    iconUrl: "school.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  fetch("data_all.json")
    .then((response) => response.json())
    .then((data) => {
      const schoolCheckboxes = document.getElementById("school-checkboxes");

      data.forEach((school, index) => {
        const marker = L.marker([parseFloat(school.위도), parseFloat(school.경도)], { icon: schoolIcon }).addTo(map);

        let popupContent = `<strong>${school.학교명}</strong><br>`;
        popupContent += `교육지원청: ${school.교육지원청명}<br>`; // 교육지원청 이름 추가
        for (let year = 2008; year <= 2022; year++) {
          popupContent += `${year}년 학생수: ${school[`${year}년 학생수`]}<br>`;
        }

        marker.bindPopup(popupContent);

        // 원 추가
        const circle = L.circle([parseFloat(school.위도), parseFloat(school.경도)], {
          color: getColorByEducationOffice(school.교육지원청명),
          fillColor: getColorByEducationOffice(school.교육지원청명),
          fillOpacity: 0.5,
          radius: 800,
        }).addTo(map);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `school-${index}`;
        checkbox.value = index;
        schoolCheckboxes.appendChild(checkbox);

        const checkboxLabel = document.createElement("label");
        checkboxLabel.htmlFor = `school-${index}`;
        checkboxLabel.innerText = school.학교명;
        schoolCheckboxes.appendChild(checkboxLabel);

        marker.on("click", () => {
          const checkbox = document.getElementById(`school-${index}`);
          checkbox.checked = !checkbox.checked;

          if (checkbox.checked) {
            marker.setIcon(createSchoolIcon(true));
          } else {
            marker.setIcon(createSchoolIcon(false));
          }
        });

        const label = L.divIcon({
          className: 'school-label',
          html: `<div>${school.학교명}</div>`,
          iconSize: null // 추가
        });

        const labelText = L.marker([parseFloat(school.위도), parseFloat(school.경도)], {
          icon: label,
          zIndexOffset: 100 // 이 값을 더 크게 설정해 보세요.
        }).addTo(map);

      });

      const aggregateButton = document.getElementById("aggregate-button");
      aggregateButton.addEventListener("click", () => {
        const selectedCheckboxes = Array.from(document.querySelectorAll("#school-checkboxes input:checked"));
        const selectedSchools = selectedCheckboxes.map((checkbox) => data[checkbox.value]);

        const { aggregatedCounts, schoolNames } = aggregateStudentCounts(selectedSchools);
        drawChart(aggregatedCounts, schoolNames);
      });

    })
    .catch((error) => console.error("Error loading school data:", error));

});

document.getElementById('download-chart').addEventListener('click', () => {
  if (!myChart) {
    alert('차트가 존재하지 않습니다. 학생수 추이 확인을 먼저 해주세요.');
    return;
  }

  const link = document.createElement('a');
  link.href = myChart.toBase64Image();
  link.download = 'chart.png';
  link.click();
});

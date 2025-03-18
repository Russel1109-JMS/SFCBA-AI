import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('salesChart') salesChart!: ElementRef;
  @ViewChild('customerSegmentChart') customerSegmentChart!: ElementRef;

  predictedSales: number | null = null;
  customerSegment: number | null = null;
  salesChartInstance!: Chart;
  segmentChartInstance!: Chart;

  constructor(private apiService: ApiService) { }

  ngAfterViewInit() {
    this.initializeSalesChart();
    this.initializeSegmentChart();

    // Test sample data
    setTimeout(() => {
        this.updateSalesChart(0, 0);

        this.updateSegmentChart(0);
        this.updateSegmentChart(1);
        this.updateSegmentChart(2);
    }, 1000); // Delay to ensure charts are initialized
}


  getSalesPrediction(monthInput: HTMLInputElement) {
    const month = parseInt(monthInput.value, 10);
    if (!isNaN(month) && month >= 1 && month <= 12) {
        this.apiService.predictSales(month).subscribe(response => {
            console.log("Sales Prediction API Response:", response);  // Debugging
            this.predictedSales = response.predicted_sales;
            this.updateSalesChart(month, this.predictedSales);
        });
    } else {
        console.error("Invalid input: Please enter a valid month number (1-12).");
    }
}

getCustomerSegment(featuresInput: HTMLInputElement) {
    const features = featuresInput.value.split(',').map(value => Number(value.trim()));
    if (features.every(f => !isNaN(f))) {
        this.apiService.segmentCustomers(features).subscribe(response => {
            console.log("Customer Segment API Response:", response);  // Debugging
            this.customerSegment = response.customer_segment;
            this.updateSegmentChart(this.customerSegment);
        });
    } else {
        console.error("Invalid input: Please enter valid numbers separated by commas.");
    }
}


initializeSalesChart() {
  if (this.salesChartInstance) {
      this.salesChartInstance.destroy(); // Destroy existing chart before creating a new one
  }
  this.salesChartInstance = new Chart(this.salesChart.nativeElement, {
      type: 'line',
      data: {
          labels: [],
          datasets: [{
              label: 'Predicted Sales',
              data: [],
              borderColor: 'blue',
              borderWidth: 2,
              fill: false,
              tension: 0.3
          }]
      },
      options: {
          responsive: true,
          scales: {
              x: { title: { display: true, text: 'Month' } },
              y: { title: { display: true, text: 'Sales' }, beginAtZero: true }
          }
      }
  });
}

initializeSegmentChart() {
  if (this.segmentChartInstance) {
      this.segmentChartInstance.destroy(); // Destroy existing chart before creating a new one
  }
  this.segmentChartInstance = new Chart(this.customerSegmentChart.nativeElement, {
      type: 'pie',
      data: {
          labels: ['Segment 0', 'Segment 1', 'Segment 2'],
          datasets: [{
              label: 'Customer Segments',
              data: [0, 0, 0],
              backgroundColor: ['red', 'green', 'blue']
          }]
      },
      options: {
          responsive: true
      }
  });
}


  updateSalesChart(month: number, predictedSales: number | null) {
    if (predictedSales !== null) {
        console.log("Updating Sales Chart:", month, predictedSales);  // Debugging
        this.salesChartInstance.data.labels?.push(month.toString());
        this.salesChartInstance.data.datasets[0].data.push(predictedSales);
        this.salesChartInstance.update();
    }
}

updateSegmentChart(segment: number | null) {
    if (segment !== null && Array.isArray(this.segmentChartInstance.data.datasets[0].data)) {
        let dataset = this.segmentChartInstance.data.datasets[0].data as number[];
        console.log("Updating Segment Chart:", segment, dataset);  // Debugging
        dataset[segment] = (dataset[segment] || 0) + 1; // Increment count
        this.segmentChartInstance.update();
    }
}

}

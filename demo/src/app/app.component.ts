import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public eventMock;
  public toggled;

  handleSelection(e) {
    this.eventMock = JSON.stringify(e);
    console.log(e);
  }
}

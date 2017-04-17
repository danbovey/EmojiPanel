import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public eventMock;
  public eventPosMock;
  public toggled;

  handleSelection(e) {
    this.eventMock = JSON.stringify(e);
    console.log('Emoji event: ' + this.eventMock);
  }

  handleCurrentPosition(e) {
    this.eventPosMock = `{ caretOffset : ${e.caretOffset}, caretRange: Range{...} }`;
    console.log('Caret position: ' + this.eventPosMock);
  }
}

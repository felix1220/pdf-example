import { Component, AfterViewInit } from '@angular/core';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  page: number = 1;
  totalPages: number;
  isLoaded: boolean = false;
  title = 'pdf-example';
  viewPort: HTMLElement;
  startPosX: number;
  startPosY: number;
  isMouseDown: boolean = false;
  textPositions: any[];
  textPercent: any[];
  endPosX: number;
  endPosY: number;
  pageWidth: number;
  pageHeight: number;
  errorX: number =  .2;
  errorY: number =  -.075;

  constructor() {
    this.textPositions = new Array<any>();
    this.textPercent = new Array<any>();
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
    console.log(pdfData);
   const pageData =  pdfData.getPage(1); 
   
   pageData.then( (page) => {
   
     const vb  = page.getViewport().viewBox;
     this.pageWidth = vb[2];
     this.pageHeight = vb[3];
     console.log(this.pageWidth, this.pageHeight);
     console.log(this.viewPort.offsetWidth, this.viewPort.offsetHeight);
    
    page.getTextContent().then( (text) => {
     
      this.textPositions.push(...text.items);
      text.items.forEach( item => {
      
        this.textPercent.push ( {
          str: item.str,
          x : item.transform[4],
          y : item.transform[5]
        })
      })
      console.log(this.textPercent);
    
      this.loadMarkers(this.textPercent[46]);
      this.loadMarkers(this.textPercent[49]);
      this.loadMarkers(this.textPercent[50])
      this.loadMarkers(this.textPercent[0])
     
      this.textPercent.forEach( item => {
        item.x += item.x * this.errorX;
        item.y += item.x * this.errorY;
      })

      this.loadMarkers(this.textPercent[46], 'black');
      this.loadMarkers(this.textPercent[49], 'black');
      this.loadMarkers(this.textPercent[50], 'black');
      this.loadMarkers(this.textPercent[0], 'black')

    })
   })
    // console.log('Total Pages =>', this.totalPages);
  }
  loadMarkers(obj: any, color: string = 'red'):void {
   
     const h = Math.floor(this.viewPort.clientHeight - obj.y);
     const cssOut = this.getCSS(obj.x, h, 5, 5, color);
     const rect = document.createElement('div');
     rect.setAttribute('style', cssOut)
     this.viewPort.appendChild(rect);
     console.log('marker loaded =>', obj);

  }
  captureEvent(e) {
    console.log('Mouse Down =>',this.page );
    if(this.viewPort) {
     
      const cssOut = this.getCSS(e.pageX, e.pageY);
      this.startPosX = e.pageX;
      this.startPosY = e.pageY;
      const rect = document.createElement('div');
      rect.setAttribute('style', cssOut)
      // console.log('Viewport =>', this.viewPort.lastChild.nodeName);
      if( this.viewPort.lastChild.nodeName === 'DIV' && this.viewPort.childNodes.length > 9) {
        document.querySelector('#pdfOverlay > :last-child').remove()
      }
      this.viewPort.appendChild(rect);

    }
    this.isMouseDown = true;
  }
  captureMove(e) {
   // console.log('Mouse Move =>', e );
    if(this.viewPort && this.isMouseDown) {
      const width= e.pageX - this.startPosX;
      const height = e.pageY - this.startPosY;
      this.endPosX = e.pageX;
      this.endPosY = e.pageY;
      document.querySelector('#pdfOverlay > :last-child').remove();
      const cssOut = this.getCSS(this.startPosX, this.startPosY, width, height);
      const rect = document.createElement('div');
      rect.setAttribute('style', cssOut)
      this.viewPort.appendChild(rect);

    }
  
  }
  captureMouseUp(e) {
    const newStartY = this.pageHeight - this.startPosY; //reverse the Y axis
    const newEndY = this.pageHeight - this.endPosY;
    const foundText = this.textPercent.filter ( item => item.y > newEndY && item.y < newStartY &&
                                      item.x > this.startPosX && item.x < this.endPosX)
     this.isMouseDown = false;
    console.log('Mouse Up=>', this.startPosY, this.endPosY, foundText);
    document.querySelector('#pdfOverlay > :last-child').remove();
  }
  ngAfterViewInit() {
    // ...
   
    this.viewPort = document.getElementById('pdfOverlay');
  
  }
  private getCSS(posX: number, posY: number, width:number = 10, height: number= 10, borderColor: string = 'black'): string {
    return `position: absolute; left: ${posX}px; top: ${posY}px; border: 2px solid ${borderColor}; width: ${width}px;height:${height}px`
  }

}

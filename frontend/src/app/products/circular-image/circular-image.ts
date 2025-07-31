import { Component, Input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CarouselComponent,
  CarouselConfig,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent
} from '@coreui/angular';
import { CarouselCustomConfig } from './carroussel.config';
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'app-circular-image',
    imports: [CommonModule, CarouselComponent, CarouselInnerComponent, CarouselItemComponent, CarouselControlComponent, RouterLink, MatButtonToggleModule, MatIconModule],
    templateUrl: './circular-image.html',
    styleUrl: './circular-image.css',
    providers: [{ provide: CarouselConfig, useClass: CarouselCustomConfig }]
})
export class CircularImage {
    @Input() productimg!: string[];
    slides: any[] = new Array(3).fill({ id: -1, src: '', title: '', subtitle: '' });
    constructor() { }

    ngOnInit() {
        this.productimg.forEach((valu, index) => {
            this.slides[index] = {
                src: valu
            };
        })
    }
}

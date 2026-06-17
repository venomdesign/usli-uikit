import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_RADIO_GROUP } from '../radio-group.token';

@Component({
  selector: 'usli-radio',
  standalone: true,
  templateUrl: './usli-radio.component.html',
  styleUrl: './usli-radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliRadioComponent {
  value = input.required<unknown>();
  label = input.required<string>();

  private readonly group = inject(USLI_RADIO_GROUP);

  protected isSelected = computed(() => this.group.value() === this.value());

  protected select(): void { this.group.select(this.value()); }
  protected onBlur(): void { this.group.onTouched(); }
}

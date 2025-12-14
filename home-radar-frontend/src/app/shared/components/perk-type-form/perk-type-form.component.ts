import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PerkTypeService} from '../../../core/services/perk-type.service';

@Component({
  selector: 'perk-type-form',
  templateUrl: './perk-type-form.component.html',
  styleUrls: ['./perk-type-form.component.scss'],
  imports: [
    ReactiveFormsModule
  ]
})
export class PerkTypeFormComponent implements OnInit {
  perkTypeForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private perkTypeService: PerkTypeService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.perkTypeForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      defaultPerkTypeWeight: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.perkTypeForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requestPayload = {
      ...this.perkTypeForm.value
    };

    const formData = new FormData();

    formData.append(
      'request',
      new Blob([JSON.stringify(requestPayload)], {
        type: 'application/json'
      })
    );

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.perkTypeService.createPerkType(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Perk type created successfully!';
        this.perkTypeForm.reset({
          name: '',
          description: '',
          defaultPerkTypeWeight: 0
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating perk type:', error);
        this.errorMessage = 'Failed to create perk type. Please try again.';
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.perkTypeForm.reset({
      name: '',
      description: '',
      defaultPerkTypeWeight: 0
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0] as File;
  }
}

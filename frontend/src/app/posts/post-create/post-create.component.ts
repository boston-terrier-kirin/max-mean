import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  private mode: string = 'create';
  private postId: string | null = null;

  isLoading = false;
  imagePreview = '';

  form = new FormGroup({
    title: new FormControl('', { validators: [Validators.required] }),
    image: new FormControl(null, {
      validators: [Validators.required],
      asyncValidators: mimeType,
    }),
    content: new FormControl('', { validators: [Validators.required] }),
  });

  constructor(public postService: PostService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');

        if (this.postId) {
          this.isLoading = true;
          this.postService.getPost(this.postId).subscribe((post) => {
            this.isLoading = false;

            this.form.controls['title'].setValue(post?.title);
            this.form.controls['content'].setValue(post?.content);

            // Editの場合はデフォルトでファイルパスを設定しておく。
            // ファイルを更新する場合、Fileで上書きされる。
            this.form.controls['image'].setValue(post?.imagePath);
          });
        }
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    if (this.mode === 'create') {
      this.postService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
  }

  onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

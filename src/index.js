class CropImgCanvas {
  showCropped = true;
  difficult = 4;
  imgCropInfo = {
    imgUrl: "./src/assets/sample.png",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    crop_x: 0,
    crop_y: 0,
    crop_width: 0,
    crop_height: 0,
  };

  size = 300;
  scale = 1;
  image = null;
  canvas;
  ctx;
  drawImgInfo = {};

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = window.devicePixelRatio || 1;

    this.initCanvas();
  }

  initCanvas() {
    this.canvas.setAttribute("width", `${this.size * this.scale}px`);
    this.canvas.setAttribute("height", `${this.size * this.scale}px`);
    this.canvas.setAttribute(
      "style",
      `width: ${this.size}px;height: ${this.size}px;border: black 1px solid;`
    );
  }

  async starter() {
    this.image = await this.loadImageFromUrl(this.imgCropInfo.imgUrl);

    this.imgCropInfo = {
      ...this.imgCropInfo,
      ...this.initRandomCropImg(this.image, this.difficult),
    };

    this.drawImgInfo = this.calcCenterCroppedImage(
      this.image,
      this.imgCropInfo.x,
      this.imgCropInfo.y,
      this.imgCropInfo.width,
      this.imgCropInfo.height,
      this.size * this.scale,
      this.size * this.scale
    );

    this.renderCropImageBox(
      this.ctx,
      this.drawImgInfo,
      this.imgCropInfo,
      this.size * this.scale,
      this.size * this.scale
    );
  }

  loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        resolve(image);
      };
      image.onerror = () => {
        const tempImage = new Image(300, 300);
        resolve(tempImage);
      };
    });
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

  initRandomCropImg(image, difficult) {
    const cropImageInfo = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    };
    cropImageInfo.width = image.width / difficult;
    cropImageInfo.height = image.height / difficult;

    const difficultSplitNum = difficult * difficult;

    const randomInt = this.getRandomInt(0, difficultSplitNum);

    cropImageInfo.x = (randomInt % difficult) * cropImageInfo.width;
    cropImageInfo.y = Math.floor(randomInt / difficult) * cropImageInfo.height;

    // if (imgCropInfo) {
    // 	this.cropImageInfo.width = this.imgCropInfo.crop_width;
    // 	this.cropImageInfo.height = this.imgCropInfo.crop_height;
    // 	this.cropImageInfo.x = this.imgCropInfo.crop_x;
    // 	this.cropImageInfo.y = this.imgCropInfo.crop_y;
    // }

    return cropImageInfo;
  }

  calcCenterCroppedImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    canvasWidth,
    canvasHeight
  ) {
    return {
      image,
      sx: cropX,
      sy: cropY,
      sWidth: cropWidth,
      sHeight: cropHeight,
      dx: (canvasWidth - cropWidth) / 2,
      dy: (canvasHeight - cropHeight) / 2,
      dWidth: cropWidth,
      dHeight: cropHeight,
    };
  }

  calcRatio(
    srcWidth,
    srcHeight,
    isCropped = true,
    renderBoxWidth = 300,
    renderBoxHeight = 300
  ) {
    if (isCropped) {
      return srcWidth > srcHeight
        ? srcWidth / renderBoxWidth
        : srcHeight / renderBoxHeight;
    } else {
      return srcWidth > srcHeight
        ? renderBoxWidth / srcWidth
        : renderBoxHeight / srcHeight;
    }
  }

  renderCenterstageImage(
    ctx,
    drawImgInfo,
    cropImgInfo,
    renderBoxWidth = 300,
    renderBoxHeight = 300
  ) {
    const ratio = this.calcRatio(
      cropImgInfo.width,
      cropImgInfo.height,
      false,
      renderBoxWidth,
      renderBoxHeight
    );
    ctx.drawImage(
      drawImgInfo.image,
      drawImgInfo.sx,
      drawImgInfo.sy,
      drawImgInfo.sWidth,
      drawImgInfo.sHeight,
      (renderBoxWidth - drawImgInfo.dWidth * ratio) / 2,
      (renderBoxHeight - drawImgInfo.dHeight * ratio) / 2,
      drawImgInfo.dWidth * ratio,
      drawImgInfo.dHeight * ratio
    );
    return this.calcCenterCroppedImage(
      drawImgInfo.image,
      cropImgInfo.x,
      cropImgInfo.y,
      cropImgInfo.width,
      cropImgInfo.height,
      renderBoxWidth,
      renderBoxHeight
    );
  }

  zoomOutImage(drawImgInfo, cropImgInfo, speed = 50) {
    cropImgInfo.x += (0 - cropImgInfo.x) / speed;
    cropImgInfo.y += (0 - cropImgInfo.y) / speed;
    cropImgInfo.width += (drawImgInfo.image.width - cropImgInfo.width) / speed;
    cropImgInfo.height +=
      (drawImgInfo.image.height - cropImgInfo.height) / speed;
    return {
      ...cropImgInfo,
    };
  }

  renderCropImageBox(
    ctx,
    drawImgInfo,
    cropImageInfo,
    canvasWidth,
    canvasHeight
  ) {
    const draw = () => {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (drawImgInfo.image) {
        drawImgInfo = this.renderCenterstageImage(
          ctx,
          drawImgInfo,
          cropImageInfo,
          canvasWidth,
          canvasHeight
        );

        if (!this.showCropped) {
          cropImageInfo = this.zoomOutImage(drawImgInfo, cropImageInfo);
        }
      }
    };

    draw();
  }
}

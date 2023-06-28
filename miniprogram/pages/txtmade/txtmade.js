// miniprogram/pages/qrlist/qrlist.js
import qrcode from '../../js/artqrcoed.js'
import common from '../../js/common.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    styleInfo: null,
    imginfo: null,
    qrinfo: {
      canvasid: 'qrcode',
      size: '',
      text: '',
      img: ''
    },
    ifmadeqr: false,
    pbtip: false,
    tip: "",
    pbqr:false,
  },
  addlikenum(id) {
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'reportQRLike',
      // 传给云函数的参数
      data: {
        qr_id: id
      },
      // 成功回调
      complete: (res) => {
        console.log("add 1")
      }
    })
  },
  saveimg() {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.qrinfo.size,
      height: that.data.qrinfo.size,
      canvasId: that.data.qrinfo.canvasid,
      success: function (data) {
        wx.saveImageToPhotosAlbum({
          filePath: data.tempFilePath,
          success: (res) => {
            console.log("保存成功")
          },
          fail: (err) => {}
        })
      }
    })
  },
  getsize() {
    return new Promise((resolve, reject) => {
      var that = this;
      var query = wx.createSelectorQuery();
      query.select('.qrcode').boundingClientRect(function (rect) {
        var qrsize = 'qrinfo.size'
        that.setData({
          [qrsize]: rect.height
        })
        resolve();
      }).exec();
    })
  },
  async madeTxt() {
    if (this.data.qrinfo.text == '') {
      this.setData({
        tip: '(▼へ▼メ)请输入文字吖～',
        pbtip: true
      });
      return;
    }
  
    if (this.data.styleInfo == null) {
      this.setData({
        tip: 'o(▼皿▼メ;)o选择二维码风格吖～',
        pbtip: true
      });
      return;
    }
  
    try {
      const res = await common.checkText(this.data.qrinfo.text);
      if (res === 'pass') {
        this.setData({
          pbimg: false,
          pbqr: true
        });
  
        await this.manageimgs();
        await this.getsize();
        this.addlikenum(this.data.styleInfo._id);
        await qrcode.getqrcode(this.data.qrinfo, this.data.imginfo);
  
        this.setData({
          ifmadeqr: true
        });
      } else {
        this.setData({
          tip: '(▼へ▼メ)文明有礼貌,不要乱发敏感词！～',
          pbtip: true
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
,  
  gettxt(e) {
    var txt = `qrinfo.text`;
    this.setData({
      [txt]: e.detail.value
    })
    wx.setStorage({
      key: "qrtxt",
      data: e.detail.value
    })
  },
  close() {
    this.setData({
      pbqr:false,
      pbtip: false,
      ifmadeqr: false
    })
  },
  async manageimgs() {
    var info = this.data.styleInfo;
    var imgs = {
      eye: info.eye,
      one: info.one,
      tian: info.tian,
      col2: info.col2,
      col3: info.col3,
      col4: info.col4,
      row2: info.row2,
      row3: info.row3,
      row4: info.row4,
      re7: info.re7,
      po7: info.po7,
  }
    for (const key in imgs) {
      if (imgs.hasOwnProperty(key)) {
        const element = imgs[key];
        if (element) {
          await wx.cloud.downloadFile({
            fileID: element
          }).then(res => {
            imgs[key] = res.tempFilePath;
          }).catch(error => {})
        }

      }
    }
    this.setData({
      imginfo: imgs
    })
  },
  goqrlist() {
    wx.navigateTo({
      url: '/pages/qrlist/qrlist?pagefrom=txtmade'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.info) {
      var info = JSON.parse(options.info)
      this.setData({
        styleInfo: info
      })
      wx.getStorage({
        key: 'qrtxt',
        success(res) {
          var txt = `qrinfo.text`
          var data=res.data;
          that.setData({
            [txt]:data
          })
        }
      })
    }
  }
})
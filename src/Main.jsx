import React from 'react';
import PropTypes from 'prop-types';
import HashRouter from 'react-router-dom/HashRouter';
import RouterLink from 'react-router-dom/Link';
import TimeAgo from 'react-timeago';
import Modal from 'react-modal';

// const url = `https://websocket.clumsily48.hasura-app.io/`;
const url = `http://localhost:1234`;
const timeAgoMinPeriod = 10;
const pagesListMax = 10;

// TODO: Make appropriate cross-origin correspondence
// Avoid unnecessary caching in IE browser
let headers = {};
const userAgent = window.navigator.userAgent.toLowerCase();
if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
  headers = { pragma: 'no-cache' };
}

export default class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      page: "upload", pageTitle: "", userInfo: {} ,pages: [], currentPageNum: 1, getPagesError: '', modalIsOpen: false, deletePageName: '', deleteErrorMsg: '',
    };
    this.refInputNewPageName = React.createRef();
    this.refContainer = React.createRef();
    this.handleNew = this.handleNew.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleDeleteOpenModal = this.handleDeleteOpenModal.bind(this);
    this.handleDeleteCloseModal = this.handleDeleteCloseModal.bind(this);
    this.handleDeleteOkBtnModal = this.handleDeleteOkBtnModal.bind(this);
    this.changeToDashboard = this.changeToDashboard.bind(this);
    this.changeToPages = this.changeToPages.bind(this);
    this.changeToUpload = this.changeToUpload.bind(this);
    this.changeToCreatePage = this.changeToCreatePage.bind(this);
    this.changeToDocumentation = this.changeToDocumentation.bind(this);
  }
  componentDidMount() {
    Modal.setAppElement(this.refContainer.current);
    this.getListPages();
    this.getDate();
    this.putUserDetails();
    // window.onscroll = function() {var titleBar = document.getElementById("titlebar");
    // var sticky = titleBar.offsetTop;

    // var statusBox = document.getElementById("status");
    // console.log(titleBar.offsetTop)
    // console.log(window.pageYOffset)
    //     if (window.pageYOffset >= sticky) {
    //       titleBar.classList.add("sticky")
    //     } else {
    //       titleBar.classList.remove("sticky");
    //     }
    //     if (window.pageYOffset >= 100) {
    //       statusBox.classList.add("stickyside")
    //     } else {
    //       statusBox.classList.remove("stickyside");
    //     }};
  }
  getDate(){
    let n =  new Date();
    let y = n.getFullYear();
    let m = n.getMonth() + 1;
    let d = n.getDate();
    document.getElementById("random_date").innerHTML = m + "/" + d + "/" + y;
  }
  putUserDetails () {
    this.setState({
      userInfo: JSON.parse(document.cookie.split("hasura_auth_uikit=")[1].split("}}")[0]+"}}")['user_info']
    })
  }
  async getListPages() {
    try {
      const response = await window.fetch(`${url}/pages`, {
        headers,
      });
      const data = await response.json();
      this.setState({
        pages: data.sort((x, y) => {
          if (x.modified === y.modified) return 0;
          if (!x.modified) return 1;
          if (!y.modified) return -1;
          if (x.modified > y.modified) {
            return -1;
          }
          if (x.modified < y.modified) {
            return 1;
          }
          return 0;
        }),
        getPagesError: '',
      });
    } catch (e) {
      this.setState({ pages: [], getPagesError: `Get Pages Error [ ${e} ]` });
    }
  }
  handleNew() {
    const pageName = this.refInputNewPageName.current.value;
    if (pageName) {
      this.context.router.history.push(`/page/${pageName}`);
    }
  }
  handleDeleteOpenModal(e) {
    this.setState({ modalIsOpen: true, deletePageName: e.target.id });
  }
  handleDeleteCloseModal() {
    this.setState({ modalIsOpen: false, deleteErrorMsg: '' });
  }
  async handleDeleteOkBtnModal() {
    try {
      const res = await window.fetch(`${url}/deletePage`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: this.state.deletePageName,
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        this.getListPages();
        this.setState({ modalIsOpen: false, deleteErrorMsg: '' });
      } else {
        this.setState({ deleteErrorMsg: `Error: ${data.msg}` });
      }
    } catch (e) {
      this.setState({ deleteErrorMsg: `Error: ${e}` });
    }
  }

  handlePrevious() {
    this.setState({ currentPageNum: this.state.currentPageNum - 1 });
  }
  handleNext() {
    this.setState({ currentPageNum: this.state.currentPageNum + 1 });
  }

  renderListPages() {
    const metadataStyle = {
      margin: '0 0 0 0.5em',
      color: 'grey',
    };
    const totalPageCount = Math.ceil(this.state.pages.length / pagesListMax);
    const currentPages = this.state.pages.slice((this.state.currentPageNum - 1) * pagesListMax, this.state.currentPageNum * pagesListMax);
    console.log(currentPages)
    return (
      <React.Fragment>
      {this.state.getPagesError}
      <ul>
        {currentPages.map(p => (
          <li key={p.page}>
            <RouterLink to={`/page/${decodeURIComponent(p.page)}`}>{decodeURIComponent(p.page)}</RouterLink>
            <span style={metadataStyle}>(created: <TimeAgo date={p.created} minPeriod={timeAgoMinPeriod} />, modified: <TimeAgo date={p.modified} minPeriod={timeAgoMinPeriod} />, active: {p.active})</span>
            <button className="deleteBtn" onClick={this.handleDeleteOpenModal} id={p.page}>Delete</button>
          </li>))}
      </ul>
      {this.state.currentPageNum > 1 ? <button type="button" onClick={this.handlePrevious}>Prev</button> : null}
      {this.state.pages.length > pagesListMax ? <span>&nbsp;Page:{this.state.currentPageNum}&nbsp;</span> : null}
      {this.state.currentPageNum < totalPageCount ? <button type="button" onClick={this.handleNext}>Next</button> : null}
    </React.Fragment>
    );
  }

  renderCreatePage() {
    return (
      <div>
      <p  style={{color: "#1C2E36", align: "center"}}>
      Create a new page: </p>
        <div className="createheader">
      <div className="headersearch">
      <input ref={this.refInputNewPageName}  type="text" style={{color: "#1C2E36"}} placeholder="new page name" />
      <input type="button" value="Create" class="button1" onClick={this.handleNew} />
    </div>
    </div>
    </div>
    )
  }
  renderUploadPage() {
    return (
      <div className="contentmain">
      <div className="contentmainpage">
        <div className="box" >
          <form>
            <div className="fieldgroup">
              <label>Title</label>
              <input type="text"/>
            </div>
            <div className="fieldgroup">
              <label>Subtitle</label>
              <input type="text"/>
            </div>
            <div className="fieldgroup">
              <label>Excerpt</label>
              <textarea></textarea>
            </div>
            <div className="fieldgroup">
              <label>Image</label>
              <div className="imagedrop">
                <svg className="lnr lnrcloudupload icon"></svg>
                <span>Drop image here to upload</span>
              </div>

            </div>
          </form>
        </div>
      </div>
      <div className="contentmainsidebar" id="status">
        <div className="box">
          <div className="boxline">
            <h5>Status</h5>
            <a href="#" className="published">
              Published
            </a>
            <a href="#" className="">
              Draft
            </a>
          </div>
          <div className="boxline">
            <h5>Schedule</h5>

            <a href="#" className="">
              Now
            </a>
          </div>
          <button id="submit" className="button">Save</button>
        </div>
      </div>
    </div>
    )
  }
  renderDashboard() {
    return (
      "dashboard"
    )
  }
  renderDocumentation() {

    return (
      <div style={{ margin: '8px' }} ref={this.refContainer}>

        <h2>List of pages</h2>
        {this.renderListPages()}
        <h2>Documentation</h2>
        <ul>
          <li>List of sample applications
            <ul>
              <li><RouterLink to="/doc/app-hello">Hello</RouterLink></li>
              <li><RouterLink to="/doc/app-kanban">Kanban</RouterLink></li>
              <li><RouterLink to="/doc/app-hello">Hello</RouterLink></li>
              <li><RouterLink to="/doc/app-youtube">Kanban</RouterLink></li>
            </ul>
          </li>
        </ul>
        <h2>License</h2>
        <ul>
          <li><a href="LICENSE.txt">The MIT License</a>. Source code is available on <a href="https://github.com/harsh-98">GitHub</a>.</li>
          <li><a href="LICENSE.txt">Attibution notice for third party software</a></li>
        </ul>
      </div>
    )
  }
  pageGenerator() {
    if (this.state.page == "upload") {
      return this.renderUploadPage()
    }
    else if (this.state.page == "create") {
      return this.renderCreatePage()
    }
    else if (this.state.page == "pages") {
      return this.renderListPages()
    }
    else if (this.state.page == "documentation") {
      return this.renderDocumentation()
    }
    else if (this.state.page == "dashboard") {
      return this.renderDashboard()
    }
  }
  changeToPages(){ this.setState({page: 'pages'}) }
  changeToDashboard(){ this.setState({page: 'dashboard'}) }
  changeToUpload(){ this.setState({page: 'upload'}) }
  changeToDocumentation(){ this.setState({page: 'documentation'}) }
  changeToCreatePage(){ this.setState({page: 'create'}) }

  render() {
    const modalStyles = {
      wrapper: {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        },
      },
      pageName: {
        marginTop: '10px',
      },
      error: {
        color: '#e74c3c',
      },
    };
    return (
      <div>
<div className="sidebar">
  <div className="sidebarsections">
    <ul>
      <li><a href="#" onClick={this.changeToDashboard}>
      <i className="fa fa-address-card fa-2x" aria-hidden="true"></i>
        Dashboard</a>
      </li>
      <li><a href="#" onClick={this.changeToPages}>
      <i className="fa fa-window-restore fa-2x" aria-hidden="true"></i>
        Pages</a>
        </li>
      <li><a href="#" onClick={this.changeToUpload}>
      <i className="fa fa-upload fa-2x" aria-hidden="true"></i>
        Upload</a></li>
      <li><a href="#" onClick={this.changeToCreatePage}>
      <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
        Create</a></li>
      <li><a href="#" onClick={this.changeToDocumentation}>
      <i className="fa fa-list fa-2x"></i>
        Documentation</a></li>
    </ul>
  </div>
  <div className="sidebarsubsections">
    <div className="sidebarsubsectionsbrand">Dashboard 1.0</div>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Projects</a></li>
      <li><a href="#">Showcase</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </div>
</div>
<div className="page">

  <div className="header">
    <div className="headersearch">
      <input type="text" placeholder="Search..." />
    </div>
    <div className="headerdate">
      <span id="random_date"></span>
    </div>
    <div className="headeruser">
      Hello, {this.state.userInfo['username']}

    </div>
  </div>

  <div className="content">
    <div className="title" id="titlebar">
      <div className="titletext">
        <span>Title</span>
        <h1>{this.state.pageTitle}</h1>
      </div>
      <div className="titleextras">
        <svg className="lnr lnrstar icon"></svg> Featured post
      </div>
    </div>
    <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.handleDeleteCloseModal}
          style={modalStyles.wrapper}
          contentLabel="Delete page"
        >
          <div>Do you really want to delete?</div>
          <div style={modalStyles.pageName}>&quot;{this.state.deletePageName}&quot;</div>
          {this.state.deleteErrorMsg !== '' ? <div style={modalStyles.error}>{this.state.deleteErrorMsg}</div> : null}
          <button className="deleteCancelBtnModal" onClick={this.handleDeleteCloseModal}>Cancel</button>
          <button className="deleteOkBtnModal" onClick={this.handleDeleteOkBtnModal}>OK</button>
        </Modal>
    {this.pageGenerator()}

  </div>
</div>
</div>
    );
  }
}

Main.contextTypes = {
  router: PropTypes.shape(HashRouter.propTypes).isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';
import { get, isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { IfPermission, TitleManager } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Col,
  ExpandAllButton,
  collapseAllSections,
  expandAllSections,
  HasCommand,
  Icon,
  Layout,
  Pane,
  PaneHeaderIconButton,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import {
  NotesSmartAccordion,
  ViewMetaData,
} from '@folio/stripes/smart-components';

import HelperApp from '../HelperApp';

import { UDPInfoView } from '../UDPInfo';
import { HarvestingConfigurationView } from '../HarvestingConfiguration';
import Statistics from '../Statistics';
import StartHarvesterModal from '../StartHarvesterModal';
import ReportUpload from '../ReportUpload';

import urls from '../../util/urls';

class UDP extends React.Component {
  constructor(props) {
    super(props);
    this.accordionStatusRef = React.createRef();

    this.state = {
      helperApp: null,
      // showReportUploadModal: false,
      showStartHarvesterModal: false,
      showCounterUpload: false,
      showNonCounterUpload: false,
    };
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.data.usageDataProvider !== prevProps.data.usageDataProvider) {
  //     this.setState({
  //       showCounterUpload: false,
  //     });
  //   }
  // }

  getInitialAccordionsState = () => {
    return {
      harvestingAccordion: false,
      sushiCredsAccordion: false,
      uploadAccordion: false,
      notesAccordion: false,
      statisticsAccordion: false,
    };
  }

  showHelperApp = (helperName) => {
    this.setState({
      helperApp: helperName,
    });
  };

  closeHelperApp = () => {
    this.setState({
      helperApp: null,
    });
  };

  reloadUdp = () => {
    const oldCount = this.props.udpReloadCount;
    this.props.mutator.udpReloadToggle.replace(oldCount + 1);
  };

  reloadStatistics = () => {
    const oldCount = this.props.statsReloadCount;
    this.props.mutator.statsReloadToggle.replace(oldCount + 1);
  };

  renderDetailMenu = (udp) => {
    const { tagsEnabled } = this.props;

    const tags = ((udp && udp.tags) || {}).tagList || [];

    return (
      <PaneMenu>
        {tagsEnabled && (
          <FormattedMessage id="ui-erm-usage.showTags">
            {(ariaLabel) => (
              <PaneHeaderIconButton
                icon="tag"
                id="clickable-show-tags"
                onClick={() => {
                  this.showHelperApp('tags');
                }}
                badgeCount={tags.length}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        )}
      </PaneMenu>
    );
  };

  isInActive = (udp) => {
    const status = get(udp, 'harvestingConfig.harvestingStatus', 'inactive');
    return !this.props.isHarvesterExistent || status === 'inactive';
  };

  openStartHarvesterModal = () => {
    this.setState({ showStartHarvesterModal: true });
  }

  closeStartHarvesterModal = () => {
    this.setState({ showStartHarvesterModal: false });
  }

  openCounterUploadModal = () => {
    this.setState({ showCounterUpload: true });
  }

  closeCounterUploadModal = () => {
    this.setState({ showCounterUpload: false });
  }

  openNonCounterUploadModal = () => {
    this.setState({ showNonCounterUpload: true });
  }

  closeNonCounterUploadModal = () => {
    this.setState({ showNonCounterUpload: false });
  }

  closeReportUploadModal = () => {
    console.log('UDP closeReportUploadModal');
    this.setState({ showCounterUpload: false });
    this.setState({ showNonCounterUpload: false });
  }

  getActionMenu = () => ({ onToggle }) => {
    const { canEdit, handlers, data } = this.props;
    const usageDataProvider = get(data, 'usageDataProvider', {});

    const providerId = get(usageDataProvider, 'id', '');

    return (
      <>
        <div>
          <IfPermission perm="ermusageharvester.start.single">
            <Button
              buttonStyle="dropDownItem"
              id="start-harvester-button"
              marginBottom0
              disabled={this.isInActive(usageDataProvider)}
              onClick={() => {
                this.openStartHarvesterModal();
                onToggle();
              }}
            >
              <Icon icon="play">
                <FormattedMessage id="ui-erm-usage.harvester.start" />
              </Icon>
            </Button>
          </IfPermission>
          { this.state.showStartHarvesterModal &&
            <StartHarvesterModal
              usageDataProvider={usageDataProvider}
              isHarvesterExistent={this.props.isHarvesterExistent}
              onReloadUDP={this.reloadUdp}
              onClose={this.closeStartHarvesterModal}
            />
          }
        </div>
        <div>
          <Button
            id="clickable-refresh-statistics"
            buttonStyle="dropDownItem"
            onClick={() => {
              onToggle();
              this.reloadStatistics();
            }}
            aria-label="Edit usage data provider"
            marginBottom0
          >
            <Icon icon="refresh">
              <FormattedMessage id="ui-erm-usage.action.refreshStatistics" />
            </Icon>
          </Button>
        </div>
        <div>
          <Button
            buttonStyle="dropDownItem"
            id="upload-counter-button"
            marginBottom0
            onClick={() => {
              this.openCounterUploadModal();
              onToggle();
            }}
          >
            <Icon icon="plus-sign">
              <FormattedMessage id="ui-erm-usage.statistics.counter.upload" />
            </Icon>
          </Button>
          {/* <ReportUpload
            udpId={providerId}
            stripes={this.props.stripes}
            onReloadStatistics={this.reloadStatistics}
            showCounterUpload={this.state.showCounterUpload}
          /> */}
        </div>
        <div>
          <Button
            buttonStyle="dropDownItem"
            id="upload-non-counter-button"
            marginBottom0
            onClick={() => {
              this.openNonCounterUploadModal();
              onToggle();
            }}
          >
            <Icon icon="plus-sign">
              <FormattedMessage id="ui-erm-usage.statistics.custom.upload" />
            </Icon>
          </Button>
          {/* <ReportUpload
            udpId={providerId}
            stripes={this.props.stripes}
            onReloadStatistics={this.reloadStatistics}
            showNonCounterUpload={this.state.showNonCounterUpload}
          /> */}
        </div>
        { (this.state.showCounterUpload || this.state.showNonCounterUpload) &&
        <ReportUpload
          udpId={providerId}
          stripes={this.props.stripes}
          onReloadStatistics={this.reloadStatistics}
          showCounterUpload={this.state.showCounterUpload}
          showNonCounterUpload={this.state.showNonCounterUpload}
          closeReportUploadModal={() => this.closeReportUploadModal}
        />
        }
        {canEdit && (
          <div>
            <Button
              id="clickable-edit-udp"
              buttonStyle="dropDownItem"
              onClick={() => {
                handlers.onEdit();
                this.goToEdit();
              }}
              aria-label="Edit usage data provider"
              marginBottom0
            >
              <Icon icon="edit">
                <FormattedMessage id="ui-erm-usage.general.edit" />
              </Icon>
            </Button>
          </div>
        )}
      </>
    );
  };

  handleEdit = () => {
    if (this.props.canEdit) {
      this.props.handlers.onEdit();
    }
  }

  shortcuts = [
    {
      name: 'edit',
      handler: this.handleEdit,
    },
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, this.accordionStatusRef)
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, this.accordionStatusRef)
    },
    {
      name: 'close',
      handler: () => this.handleCloseModal()
    },
  ];

  // handleCloseModal = () => {
  //   this.setState({ showReportUploadModal: false });
  // };

  renderLoadingPane = () => {
    return (
      <Pane
        defaultWidth="40%"
        dismissible
        id="pane-collectiondetails"
        onClose={this.props.handlers.onClose}
        paneTitle={<span data-test-collection-header-title>loading</span>}
      >
        <Layout className="marginTop1">
          <Icon icon="spinner-ellipsis" width="10px" />
        </Layout>
      </Pane>
    );
  };

  checkScope = () => {
    return document.getElementById('ModuleContainer').contains(document.activeElement);
  };

  render() {
    const {
      data,
      isLoading,
      isStatsLoading,
      handlers,
      isHarvesterExistent,
      stripes,
    } = this.props;

    const { helperApp } = this.state;

    const usageDataProvider = get(data, 'usageDataProvider', {});
    if (isLoading) return this.renderLoadingPane();

    const detailMenu = this.renderDetailMenu(usageDataProvider);

    const label = get(usageDataProvider, 'label', 'No LABEL');
    const providerId = get(usageDataProvider, 'id', '');
    if (isEmpty(usageDataProvider)) {
      return <div id="pane-udpdetails">Loading...</div>;
    } else {
      return (
        <HasCommand
          commands={this.shortcuts}
          isWithinScope={this.checkScope}
          scope={document.body}
        >
          <React.Fragment>
            <Pane
              id="pane-udpdetails"
              defaultWidth="40%"
              paneTitle={<span data-test-header-title>{label}</span>}
              actionMenu={this.getActionMenu()}
              lastMenu={detailMenu}
              dismissible
              onClose={handlers.onClose}
            >
              <TitleManager record={label} stripes={stripes} />
              <AccordionStatus ref={this.accordionStatusRef}>
                <Row end="xs">
                  <Col xs>
                    <ExpandAllButton
                      id="clickable-expand-all-view"
                    />
                  </Col>
                </Row>
                <AccordionSet initialStatus={this.getInitialAccordionsState()}>
                  <ViewMetaData
                    metadata={get(usageDataProvider, 'metadata', {})}
                    stripes={stripes}
                  />
                  <UDPInfoView
                    id="udpInfo"
                    usageDataProvider={usageDataProvider}
                    stripes={stripes}
                  />
                  <Accordion
                    label={
                      <FormattedMessage id="ui-erm-usage.udp.harvestingConfiguration" />
                    }
                    id="harvestingAccordion"
                    // displayWhenOpen={
                    //   <StartHarvesterModal
                    //     usageDataProvider={usageDataProvider}
                    //     isHarvesterExistent={isHarvesterExistent}
                    //     onReloadUDP={this.reloadUdp}
                    //   />
                    // }
                  >
                    <HarvestingConfigurationView
                      usageDataProvider={usageDataProvider}
                      stripes={stripes}
                      settings={data.settings}
                      harvesterImpls={data.harvesterImpls}
                    />
                  </Accordion>
                  <Accordion
                    label={<FormattedMessage id="ui-erm-usage.udp.statistics" />}
                    id="statisticsAccordion"
                  >
                    <Statistics
                      stripes={stripes}
                      providerId={providerId}
                      udpLabel={label}
                      counterReports={data.counterReports}
                      customReports={data.customReports}
                      isStatsLoading={isStatsLoading}
                      handlers={handlers}
                    />
                  </Accordion>
                  <Accordion
                    label={<FormattedMessage id="ui-erm-usage.udp.statsUpload" />}
                    id="uploadAccordion"
                  >
                    {/* <ReportUpload
                      udpId={providerId}
                      stripes={stripes}
                      onReloadStatistics={this.reloadStatistics}
                      showReportUploadModal={this.state.showReportUploadModal}
                    /> */}
                  </Accordion>
                  <NotesSmartAccordion
                    id="notesAccordion"
                    domainName="erm-usage"
                    entityId={usageDataProvider.id}
                    entityName={usageDataProvider.label}
                    entityType="erm-usage-data-provider"
                    pathToNoteCreate={urls.noteCreate()}
                    pathToNoteDetails={urls.notes()}
                    stripes={stripes}
                  />
                </AccordionSet>
              </AccordionStatus>
            </Pane>
            {helperApp && (
              <HelperApp appName={helperApp} onClose={this.closeHelperApp} />
            )}
          </React.Fragment>
        </HasCommand>
      );
    }
  }
}

UDP.propTypes = {
  canEdit: PropTypes.bool,
  data: PropTypes.shape({
    counterReports: PropTypes.arrayOf(PropTypes.shape()),
    customReports: PropTypes.arrayOf(PropTypes.shape()),
    harvesterImpls: PropTypes.arrayOf(PropTypes.shape()),
    settings: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    usageDataProvider: PropTypes.object,
  }).isRequired,
  handlers: PropTypes.shape({
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
  }).isRequired,
  isHarvesterExistent: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  isStatsLoading: PropTypes.bool.isRequired,
  mutator: PropTypes.shape({
    udpReloadToggle: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
    statsReloadToggle: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  udpReloadCount: PropTypes.number.isRequired,
  stripes: PropTypes.object.isRequired,
  tagsEnabled: PropTypes.bool,
  statsReloadCount: PropTypes.number.isRequired,
};

export default UDP;

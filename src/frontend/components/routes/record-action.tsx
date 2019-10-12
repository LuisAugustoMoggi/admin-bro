import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { RouteComponentProps } from 'react-router'
import Breadcrumbs from '../app/breadcrumbs'
import ActionHeader from '../app/action-header'
import WrapperBox from '../ui/wrapper-box'
import Loader from '../ui/loader'
import Notice from '../app/notice'
import BaseActionComponent from '../app/base-action-component'
import ApiClient from '../../utils/api-client'
import { RecordActionParams } from '../../../backend/utils/view-helpers'
import ResourceJSON from '../../../backend/decorators/resource-json.interface'
import RecordJSON from '../../../backend/decorators/record-json.interface'
import ActionJSON from '../../../backend/decorators/action-json.interface'
import { ReduxState } from '../../store/store'

const ContainerRecord = styled.div`
  display: flex;
  flex-direction: column;
`

const NoticeWrapper = styled.div`
  width: 100%;
  position: relative;
`

interface State {
  record: RecordJSON;
  isLoading: boolean;
}

type PropsFromState = {
  resources: Array<ResourceJSON>;
}

type Props = RouteComponentProps<RecordActionParams> & PropsFromState

class RecordAction extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      record: null,
      isLoading: true,
    }
  }

  componentDidMount(): void {
    const { match } = this.props
    this.fetchRecord(match.params)
  }

  shouldComponentUpdate(newProps: Props): boolean {
    const { match } = this.props
    const { actionName, recordId, resourceId } = match.params
    if (newProps.match.params.actionName !== actionName
      || newProps.match.params.recordId !== recordId
      || newProps.match.params.resourceId !== resourceId
    ) {
      this.fetchRecord(newProps.match.params)
      return false
    }
    return true
  }

  getResourceAndAction(name = null): { resource: ResourceJSON; action: ActionJSON} {
    const { match, resources } = this.props
    const { resourceId, actionName } = match.params
    const { record } = this.state

    const nameToCheck = name || actionName

    const resource = resources.find(r => r.id === resourceId)
    const action = record && record.recordActions.find(r => r.name === nameToCheck)
    return { resource, action }
  }

  fetchRecord({ actionName, recordId, resourceId }: RecordActionParams): void {
    const api = new ApiClient()
    this.setState({
      isLoading: true,
      record: null,
    })
    api.recordAction({
      resourceId,
      recordId,
      actionName,
    }).then((response) => {
      this.setState({
        isLoading: false,
        record: response.data.record,
      })
    })
  }

  render(): ReactNode {
    const { match } = this.props
    const { actionName, recordId } = match.params
    const { record, isLoading } = this.state

    const { resource, action } = this.getResourceAndAction()

    return (
      <ContainerRecord>
        <NoticeWrapper>
          <Notice />
        </NoticeWrapper>
        <WrapperBox>
          <Breadcrumbs
            resource={resource}
            actionName={actionName}
            record={record}
          />
          <ActionHeader
            resource={resource}
            recordId={recordId}
            action={action}
            record={record}
          />
          {isLoading
            ? <Loader />
            : (
              <BaseActionComponent
                action={action}
                resource={resource}
                record={record}
              />
            )
          }
        </WrapperBox>
      </ContainerRecord>
    )
  }
}


const mapStateToProps = (state: ReduxState): PropsFromState => ({
  resources: state.resources,
})


export default connect<PropsFromState>(mapStateToProps)(RecordAction)

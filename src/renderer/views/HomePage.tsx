import { Col, Layout, Row } from 'antd'
import styles from './HomePage.module.css'
import {
    FileList,
    FileSearch,
    BottomBtn,
    NoteContent
} from '../components/index'

const { Content } = Layout
const HomePage: React.FC = () => {
    return (
        <Row>
            <Col span={6}>
                <aside className={styles.aside}>
                    <FileSearch title="我的文档" />
                    <FileList />
                    <div className={styles['button-group']}>
                        <BottomBtn />
                    </div>
                </aside>
            </Col>
            <Col span={18}>
                <Content className={styles.content}>
                    <NoteContent />
                </Content>
            </Col>
        </Row>
    )
}
export default HomePage

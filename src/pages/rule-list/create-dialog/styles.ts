import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            maxWidth: '80vw'
        },
        createButton: {
            color: theme.palette.warning.dark
        },
        dialogContent: {
            display: 'flex',
            flex: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            overflowY: 'scroll',
            maxHeight: '40vh',
        },
        cardButton: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: 8,
            marginLeft: 8,
            marginRight: 8,
            borderColor: '#CCCCCC80',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 12,
            width: 180,
            padding: 6,
            "&:hover": {
                cursor: 'pointer',
                backgroundColor: theme.palette.grey.A100
            }
        },
        cardButtonSelected: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: 8,
            marginLeft: 8,
            marginRight: 8,
            borderColor: theme.palette.secondary.dark,
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 12,
            width: 180,
            padding: 6,
        },
        ruleAvatar: {
            padding: 4,
            margin: 4
        },
        rulesTypeHeader: {
            display: 'flex',
            margin: 4,
        },
        ruleTypeTextTitle: {
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: 18
        },
        ruleTypeTextSubtitle: {
            display: 'flex',
            marginLeft: 8,
            fontSize: 16,
            fontWeight: 700,
            color: theme.palette.common.black
        },
        samplesBox: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '20vh'
        },
        ruleSample: {
            padding: 6
        },
        ruleTypeTextSampleTitle: {
            display: 'flex',
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.grey.A700
        },
        ruleTypeTextSampleDescription: {
            display: 'flex',
            marginLeft: 8,
            fontSize: 12,
            color: theme.palette.grey.A400
        },
        selectButton: {
            color: theme.palette.warning.dark
        }
    })
  );

  export default useStyles;

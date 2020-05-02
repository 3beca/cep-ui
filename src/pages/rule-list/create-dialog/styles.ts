import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
        },
        createButton: {
            color: theme.palette.warning.dark
        },
        dialogContent: {
            overflowY: 'scroll',
            maxHeight: '60vh',
        },
        cardButton: {
            display: 'flex',
            alignItems: 'flex-start',
            margin: 16,
            borderColor: '#CCCCCC80',
            borderStyle: 'solid',
            borderWidth: 1,
            maxWidth: 300,
        },
        ruleAvatar: {
            padding: 4,
            margin: 4
        },
        rulesTypeText: {
            display: 'flex',
            flexDirection: 'column',
            margin: 14
        },
        ruleTypeTextTitle: {
            fontWeight: 700,
            fontSize: 18
        }
    })
  );

  export default useStyles;

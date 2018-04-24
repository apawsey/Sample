using System;
using System.Text.RegularExpressions;
using Flee.PublicTypes;

namespace Assessment.Engine
{
    public static class CalculationEngine
    {
        private static readonly ExpressionContext ExpressionContext = new ExpressionContext();
        private static readonly Regex SymbolValidationRegex = new Regex(@"^[\d\+\*\-\/\.]+$");

        public static string Calculate(string expression, bool returnExceptionsInResult = false)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(expression))
                    throw new ArgumentNullException(nameof(expression), "No expression was supplied.");
                bool validSymbols = SymbolValidationRegex.IsMatch(expression);
                if (!validSymbols)
                    throw new ArgumentException(
                        "Only number characters, the decimal point, or these mathematical symbols [+-/*], are allowed in the expression.");
                try
                {
                    IDynamicExpression dynamicExpression = ExpressionContext.CompileDynamic(expression);
                    object result = dynamicExpression.Evaluate();
                    return result.ToString();
                }
                catch (ExpressionCompileException ex)
                {
                    throw new ArgumentException(
                        "The expression could not be interpreted as a valid mathematical formula.", nameof(expression),
                        ex);
                }
            }
            catch (Exception ex)
            {
                if (returnExceptionsInResult)
                    return ex.Message;
                throw;
            }
        }
    }
}
